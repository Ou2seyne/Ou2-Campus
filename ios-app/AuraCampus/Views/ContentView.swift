import SwiftUI

public struct ContentView: View {
    @Bindable var store = ScheduleStore.shared

    @State private var selectedEvent: ScheduleEvent? = nil
    @State private var showingExamRadar: Bool = false
    @State private var showingHomework: Bool = false
    @State private var showingAnalytics: Bool = false
    @State private var showingUrlModal: Bool = false

    @Environment(\.colorScheme) var colorScheme

    public var body: some View {
        ZStack {
            // Fond d'écran dynamique
            GazetteTheme.bg(for: colorScheme)
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Header minimaliste (avec sélecteur Thème Clair / Sombre / Auto)
                HeaderView(
                    onOpenExamRadar: { showingExamRadar = true },
                    onOpenHomework: { showingHomework = true },
                    onOpenAnalytics: { showingAnalytics = true },
                    onOpenUrlModal: { showingUrlModal = true }
                )

                // Corps défilant
                ScrollView {
                    VStack(spacing: 12) {
                        // 1. Calendrier strip de semaine (Pronote / Papillon)
                        DateSelectorView()

                        // 2. Barre de recherche et filtres de catégorie
                        SearchBarView()

                        // Alerte éventuelle d'erreur
                        if let error = store.errorMessage {
                            HStack(spacing: 8) {
                                Image(systemName: "exclamationmark.circle.fill")
                                    .foregroundStyle(Color.red)
                                Text(error)
                                    .font(.system(size: 12, weight: .bold, design: .monospaced))
                                    .foregroundStyle(Color.red)
                            }
                            .padding(10)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.red.opacity(0.1))
                            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                        }

                        // Loader de chargement
                        if store.isLoading && store.events.isEmpty {
                            VStack(spacing: 10) {
                                ProgressView()
                                    .scaleEffect(1.1)
                                Text("Synchronisation ADE en cours...")
                                    .font(.system(size: 12, weight: .bold, design: .monospaced))
                                    .foregroundStyle(GazetteTheme.muted(for: colorScheme))
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 40)
                            .background(GazetteTheme.surface(for: colorScheme))
                            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                        } else {
                            if store.viewMode == .day {
                                // Bannière d'alerte examen ou devoirs (si pertinent pour ce jour)
                                if hasExamToday || pendingHomeworkCount > 0 {
                                    HStack(spacing: 8) {
                                        if hasExamToday {
                                            Button {
                                                showingExamRadar = true
                                            } label: {
                                                HStack(spacing: 4) {
                                                    Image(systemName: "exclamationmark.triangle.fill")
                                                        .font(.system(size: 10))
                                                    Text("Évaluation aujourd'hui")
                                                        .font(.system(size: 11, weight: .bold))
                                                }
                                                .padding(.horizontal, 8)
                                                .padding(.vertical, 5)
                                                .background(Color(hex: colorScheme == .dark ? "#200A0A" : "#FEE2E2"))
                                                .foregroundStyle(Color(hex: colorScheme == .dark ? "#F87171" : "#B91C1C"))
                                                .clipShape(Capsule())
                                            }
                                            .buttonStyle(.plain)
                                        }

                                        if pendingHomeworkCount > 0 {
                                            Button {
                                                showingHomework = true
                                            } label: {
                                                HStack(spacing: 4) {
                                                    Image(systemName: "book.fill")
                                                        .font(.system(size: 10))
                                                    Text("\(pendingHomeworkCount) devoir\(pendingHomeworkCount > 1 ? "s" : "")")
                                                        .font(.system(size: 11, weight: .bold))
                                                }
                                                .padding(.horizontal, 8)
                                                .padding(.vertical, 5)
                                                .background(Color(hex: colorScheme == .dark ? "#180E2E" : "#EDE9FE"))
                                                .foregroundStyle(Color(hex: colorScheme == .dark ? "#C4B5FD" : "#4C1D95"))
                                                .clipShape(Capsule())
                                            }
                                            .buttonStyle(.plain)
                                        }

                                        Spacer()
                                    }
                                }

                                // 3. Emploi du temps du jour (Affichage Timeline style Pronote / Papillon)
                                TimelineView { event in
                                    selectedEvent = event
                                }
                            } else {
                                // 4. Vue semaine
                                WeekView { event in
                                    selectedEvent = event
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 14)
                    .padding(.top, 10)
                    .padding(.bottom, 30)
                }
                .refreshable {
                    await store.fetchSchedule(silent: true)
                }
                // Geste de swipe horizontal pour changer de jour comme sur Papillon / Pronote
                .simultaneousGesture(
                    DragGesture(minimumDistance: 45)
                        .onEnded { value in
                            if value.translation.width < -60 {
                                // Glisser vers la gauche -> Jour suivant
                                withAnimation(.snappy(duration: 0.2)) {
                                    store.goToNextDay()
                                }
                                let impact = UIImpactFeedbackGenerator(style: .light)
                                impact.impactOccurred()
                            } else if value.translation.width > 60 {
                                // Glisser vers la droite -> Jour précédent
                                withAnimation(.snappy(duration: 0.2)) {
                                    store.goToPrevDay()
                                }
                                let impact = UIImpactFeedbackGenerator(style: .light)
                                impact.impactOccurred()
                            }
                        }
                )
            }
        }
        .preferredColorScheme(store.colorSchemeOverride)
        .task {
            if store.events.isEmpty {
                await store.fetchSchedule()
            }
        }
        .sheet(item: $selectedEvent) { event in
            CourseDetailSheet(event: event)
        }
        .sheet(isPresented: $showingExamRadar) {
            ExamRadarSheet()
        }
        .sheet(isPresented: $showingHomework) {
            HomeworkSheet()
        }
        .sheet(isPresented: $showingAnalytics) {
            AnalyticsSheet()
        }
        .sheet(isPresented: $showingUrlModal) {
            UrlInputSheet()
        }
    }

    private var hasExamToday: Bool {
        store.dayEvents.contains { $0.category == .exam }
    }

    private var pendingHomeworkCount: Int {
        store.homeworkItems.filter { !$0.isDone }.count
    }
}
