import Foundation
import SwiftUI
import Observation

@Observable
public final class ScheduleStore: @unchecked Sendable {
    public static let shared = ScheduleStore()

    // State
    public var savedSchedules: [SavedSchedule] = []
    public var currentScheduleId: String = ""
    public var events: [ScheduleEvent] = []
    public var isLoading: Bool = false
    public var isRefreshing: Bool = false
    public var errorMessage: String? = nil
    public var isOffline: Bool = false
    public var lastFetchedAt: Date? = nil

    // Filters & Navigation
    public var selectedDate: Date = Date()
    public var searchQuery: String = ""
    public var selectedCategory: CourseCategory? = nil
    public var selectedSubGroup: String = "2-2" {
        didSet {
            UserDefaults.standard.set(selectedSubGroup, forKey: subgroupKey)
        }
    }
    public var timeFilter: TimeFilter = .all
    public var viewMode: ScheduleViewMode = .day

    // Homework
    public var homeworkItems: [HomeworkItem] = []

    public enum TimeFilter: String, CaseIterable, Identifiable {
        case all = "Tous"
        case morning = "Matin (8h-13h)"
        case afternoon = "Après-midi (13h-19h)"
        public var id: String { rawValue }
    }

    public enum ScheduleViewMode: String, CaseIterable, Identifiable {
        case day = "Jour"
        case week = "Semaine"
        public var id: String { rawValue }
    }

    public enum ThemeMode: String, CaseIterable, Identifiable {
        case system = "system"
        case light = "light"
        case dark = "dark"
        public var id: String { rawValue }

        public var title: String {
            switch self {
            case .system: return "Auto"
            case .light: return "Clair"
            case .dark: return "Sombre"
            }
        }

        public var icon: String {
            switch self {
            case .system: return "circle.lefthalf.filled"
            case .light: return "sun.max.fill"
            case .dark: return "moon.fill"
            }
        }
    }

    public var themeMode: ThemeMode = .system {
        didSet {
            UserDefaults.standard.set(themeMode.rawValue, forKey: "auracampus_theme_v1")
        }
    }

    public var colorSchemeOverride: ColorScheme? {
        switch themeMode {
        case .light: return .light
        case .dark: return .dark
        case .system: return nil
        }
    }

    @MainActor
    public func setTheme(_ mode: ThemeMode) {
        withAnimation(.snappy(duration: 0.2)) {
            themeMode = mode
        }
        let impact = UIImpactFeedbackGenerator(style: .medium)
        impact.impactOccurred()
    }

    @MainActor
    public func cycleTheme() {
        switch themeMode {
        case .system: setTheme(.light)
        case .light: setTheme(.dark)
        case .dark: setTheme(.system)
        }
    }

    public static func formatDuration(minutes: Int) -> String {
        let h = minutes / 60
        let m = minutes % 60
        if h > 0 && m > 0 {
            return "\(h)h\(String(format: "%02d", m))"
        } else if h > 0 {
            return "\(h)h"
        }
        return "\(m) min"
    }

    private let schedulesKey = "auracampus_schedules_v1"
    private let activeScheduleKey = "auracampus_active_id_v1"
    private let subgroupKey = "auracampus_subgroup_v1"
    private let homeworkKey = "auracampus_homework_v1"

    private init() {
        loadFromStorage()
    }

    public var currentSchedule: SavedSchedule? {
        savedSchedules.first { $0.id == currentScheduleId }
    }

    public var availableSubGroups: [String] {
        var set = Set<String>()
        for event in events {
            if let sg = event.subGroup, !sg.isEmpty {
                set.insert(sg)
            }
        }
        return Array(set).sorted()
    }

    public var isOnline: Bool {
        !isOffline
    }

    public var examCount: Int {
        events.filter { $0.category == .exam || $0.summary.localizedCaseInsensitiveContains("ds") || $0.summary.localizedCaseInsensitiveContains("exam") }.count
    }

    // Filtrage des événements pour la date sélectionnée (triés par heure de début)
    public var dayEvents: [ScheduleEvent] {
        let calendar = Calendar.current
        return filteredEvents
            .filter { calendar.isDate($0.dtstart, inSameDayAs: selectedDate) }
            .sorted { $0.dtstart < $1.dtstart }
    }

    // Filtrage des événements pour la semaine de la date sélectionnée
    public var weekEvents: [ScheduleEvent] {
        let calendar = Calendar.current
        guard let weekInterval = calendar.dateInterval(of: .weekOfYear, for: selectedDate) else {
            return []
        }
        return filteredEvents.filter { weekInterval.contains($0.dtstart) }
    }

    // Événements globaux filtrés selon sous-groupe, catégorie et recherche
    public var filteredEvents: [ScheduleEvent] {
        events.filter { event in
            // 1. Sous-groupe (ex: 2-2 ou ALL)
            if selectedSubGroup != "ALL" {
                if let sg = event.subGroup, sg != selectedSubGroup {
                    return false
                }
            }

            // 2. Catégorie
            if let cat = selectedCategory, event.category != cat {
                return false
            }

            // 3. Filtre heure de la journée
            if timeFilter == .morning {
                let hour = Calendar.current.component(.hour, from: event.dtstart)
                if hour >= 13 { return false }
            } else if timeFilter == .afternoon {
                let hour = Calendar.current.component(.hour, from: event.dtstart)
                if hour < 13 { return false }
            }

            // 4. Recherche textuelle
            if !searchQuery.isEmpty {
                let q = searchQuery.lowercased()
                let titleMatch = event.cleanTitle.lowercased().contains(q)
                let roomMatch = event.room.lowercased().contains(q)
                let teacherMatch = event.teacher.lowercased().contains(q)
                if !titleMatch && !roomMatch && !teacherMatch {
                    return false
                }
            }

            return true
        }
    }

    public var upcomingExamsCount: Int {
        let now = Date()
        return events.filter { $0.category == .exam && $0.dtend >= now }.count
    }

    public var pendingHomeworkCount: Int {
        homeworkItems.filter { !$0.isDone }.count
    }

    // MARK: - Actions

    @MainActor
    public func fetchSchedule(silent: Bool = false) async {
        guard let schedule = currentSchedule else { return }

        if !silent {
            isLoading = true
        } else {
            isRefreshing = true
        }
        errorMessage = nil

        // Lecture cache local préalable
        loadCachedEvents(for: schedule.id)

        // Cas démo
        if schedule.url.starts(with: "demo://") {
            try? await Task.sleep(nanoseconds: 500_000_000)
            self.events = generateDemoEvents()
            self.lastFetchedAt = Date()
            self.isLoading = false
            self.isRefreshing = false
            self.isOffline = false
            return
        }

        guard let url = URL(string: schedule.url) else {
            errorMessage = "URL d'emploi du temps invalide"
            isLoading = false
            isRefreshing = false
            return
        }

        do {
            var request = URLRequest(url: url)
            request.timeoutInterval = 15
            request.setValue("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15", forHTTPHeaderField: "User-Agent")

            let (data, response) = try await URLSession.shared.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                throw URLError(.badServerResponse)
            }

            guard let icsString = String(data: data, encoding: .utf8) ?? String(data: data, encoding: .isoLatin1) else {
                throw URLError(.cannotDecodeContentData)
            }

            let parsed = iCalendarParser.shared.parse(icsContent: icsString)
            self.events = parsed
            self.lastFetchedAt = Date()
            self.isOffline = false

            // Mise en cache locale disque
            saveEventsToCache(parsed, for: schedule.id)

        } catch {
            print("Erreur téléchargement ADE: \(error.localizedDescription)")
            self.isOffline = true
            if self.events.isEmpty {
                self.errorMessage = "Impossible de récupérer l'emploi du temps en direct. Données indisponibles."
            }
        }

        isLoading = false
        isRefreshing = false
    }

    public func switchSchedule(to id: String) {
        currentScheduleId = id
        UserDefaults.standard.set(id, forKey: activeScheduleKey)
        Task {
            await fetchSchedule()
        }
    }

    public func addSchedule(name: String, url: String) {
        let newSchedule = SavedSchedule(name: name, url: url, isFavorite: false)
        savedSchedules.insert(newSchedule, at: 0)
        currentScheduleId = newSchedule.id
        saveSchedules()
        Task {
            await fetchSchedule()
        }
    }

    public func deleteSchedule(id: String) {
        savedSchedules.removeAll { $0.id == id }
        if currentScheduleId == id {
            currentScheduleId = savedSchedules.first?.id ?? ""
        }
        saveSchedules()
        Task {
            await fetchSchedule()
        }
    }

    // MARK: - Gestion des devoirs

    public func addHomework(courseTitle: String, text: String, dueDate: Date? = nil) {
        let item = HomeworkItem(courseTitle: courseTitle, text: text, dueDate: dueDate)
        homeworkItems.insert(item, at: 0)
        saveHomework()
    }

    public func toggleHomework(_ item: HomeworkItem) {
        if let idx = homeworkItems.firstIndex(where: { $0.id == item.id }) {
            homeworkItems[idx].isDone.toggle()
            saveHomework()
        }
    }

    public func deleteHomework(_ item: HomeworkItem) {
        homeworkItems.removeAll { $0.id == item.id }
        saveHomework()
    }

    // MARK: - Navigation Dates

    public func goToToday() {
        selectedDate = Date()
    }

    public func goToNextDay() {
        if let next = Calendar.current.date(byAdding: .day, value: 1, to: selectedDate) {
            selectedDate = next
        }
    }

    public func goToPrevDay() {
        if let prev = Calendar.current.date(byAdding: .day, value: -1, to: selectedDate) {
            selectedDate = prev
        }
    }

    // MARK: - Cache & Stockage

    private func loadFromStorage() {
        // 1. Plannings sauvegardés
        if let data = UserDefaults.standard.data(forKey: schedulesKey),
           let list = try? JSONDecoder().decode([SavedSchedule].self, from: data), !list.isEmpty {
            self.savedSchedules = list
        } else {
            self.savedSchedules = SavedSchedule.defaultPresets
        }

        // 2. Planning actif
        if let activeId = UserDefaults.standard.string(forKey: activeScheduleKey),
           savedSchedules.contains(where: { $0.id == activeId }) {
            self.currentScheduleId = activeId
        } else {
            self.currentScheduleId = savedSchedules.first?.id ?? ""
        }

        // 3. Sous-groupe
        if let sg = UserDefaults.standard.string(forKey: subgroupKey) {
            self.selectedSubGroup = sg
        }

        // 4. Devoirs
        if let data = UserDefaults.standard.data(forKey: homeworkKey),
           let list = try? JSONDecoder().decode([HomeworkItem].self, from: data) {
            self.homeworkItems = list
        } else {
            self.homeworkItems = HomeworkItem.sampleItems
        }

        // 5. Thème
        if let themeStr = UserDefaults.standard.string(forKey: "auracampus_theme_v1"),
           let savedTheme = ThemeMode(rawValue: themeStr) {
            self.themeMode = savedTheme
        }
    }

    private func saveSchedules() {
        if let data = try? JSONEncoder().encode(savedSchedules) {
            UserDefaults.standard.set(data, forKey: schedulesKey)
        }
        UserDefaults.standard.set(currentScheduleId, forKey: activeScheduleKey)
    }

    private func saveHomework() {
        if let data = try? JSONEncoder().encode(homeworkItems) {
            UserDefaults.standard.set(data, forKey: homeworkKey)
        }
    }

    private func cacheFilePath(for scheduleId: String) -> URL {
        let dir = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first!
        return dir.appendingPathComponent("aura_cache_\(scheduleId).json")
    }

    private func saveEventsToCache(_ events: [ScheduleEvent], for scheduleId: String) {
        let url = cacheFilePath(for: scheduleId)
        if let data = try? JSONEncoder().encode(events) {
            try? data.write(to: url, options: .atomic)
        }
    }

    private func loadCachedEvents(for scheduleId: String) {
        let url = cacheFilePath(for: scheduleId)
        guard let data = try? Data(contentsOf: url),
              let cached = try? JSONDecoder().decode([ScheduleEvent].self, from: data) else {
            return
        }
        self.events = cached
    }

    private func generateDemoEvents() -> [ScheduleEvent] {
        let cal = Calendar.current
        let today = Date()

        return [
            ScheduleEvent(
                id: "demo-1",
                summary: "CM Algorithmique et programmation 1",
                cleanTitle: "Algorithmique et programmation 1",
                category: .cm,
                dtstart: cal.date(bySettingHour: 8, minute: 30, second: 0, of: today)!,
                dtend: cal.date(bySettingHour: 10, minute: 30, second: 0, of: today)!,
                location: "Amphi Barbeaux",
                room: "Amphi Barbeaux",
                teacher: "M. Delacroix",
                subGroup: "2-2"
            ),
            ScheduleEvent(
                id: "demo-2",
                summary: "TD Calculus 1",
                cleanTitle: "Calculus 1",
                category: .td,
                dtstart: cal.date(bySettingHour: 10, minute: 45, second: 0, of: today)!,
                dtend: cal.date(bySettingHour: 12, minute: 15, second: 0, of: today)!,
                location: "Bâtiment D Salle D004",
                room: "D004",
                teacher: "M. Baranek",
                subGroup: "2-2"
            ),
            ScheduleEvent(
                id: "demo-3",
                summary: "TP Programmation Web & C",
                cleanTitle: "Programmation Web & C",
                category: .tp,
                dtstart: cal.date(bySettingHour: 13, minute: 45, second: 0, of: today)!,
                dtend: cal.date(bySettingHour: 16, minute: 45, second: 0, of: today)!,
                location: "Bâtiment D Salle D108",
                room: "D108",
                teacher: "Mme. Rousseau",
                subGroup: "2-2"
            )
        ]
    }
}
