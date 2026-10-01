import SwiftUI

public struct AnalyticsSheet: View {
    @Bindable var store = ScheduleStore.shared
    @Environment(\.dismiss) var dismiss
    @Environment(\.colorScheme) var colorScheme

    @State private var scope: AnalyticsScope = .week

    enum AnalyticsScope: String, CaseIterable, Identifiable {
        case week = "Cette semaine"
        case semester = "Semestre entier"
        public var id: String { rawValue }
    }

    private var analyzedEvents: [ScheduleEvent] {
        scope == .week ? store.weekEvents : store.filteredEvents
    }

    private var totalMinutes: Int {
        analyzedEvents.reduce(0) { $0 + $1.durationMinutes }
    }

    private var totalHoursFormatted: String {
        ScheduleStore.formatDuration(minutes: totalMinutes)
    }

    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 14) {
                    // Sélecteur de portée
                    Picker("Portée", selection: $scope) {
                        ForEach(AnalyticsScope.allCases) { s in
                            Text(s.rawValue).tag(s)
                        }
                    }
                    .pickerStyle(.segmented)

                    // Hero Statistique Volume
                    VStack(spacing: 6) {
                        Text("VOLUME D'ENSEIGNEMENT")
                            .font(.system(size: 10, weight: .heavy, design: .monospaced))
                            .foregroundStyle(GazetteTheme.muted(for: colorScheme))

                        Text(totalHoursFormatted)
                            .font(.system(size: 38, weight: .heavy, design: .monospaced))
                            .foregroundStyle(GazetteTheme.accent(for: colorScheme))

                        Text("\(analyzedEvents.count) séances programmées")
                            .font(.system(size: 12, weight: .bold, design: .monospaced))
                            .foregroundStyle(GazetteTheme.text(for: colorScheme))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 22)
                    .background(GazetteTheme.surface(for: colorScheme))
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(GazetteTheme.border(for: colorScheme), lineWidth: 1)
                    )

                    // Répartition par Catégorie
                    VStack(alignment: .leading, spacing: 14) {
                        Text("RÉPARTITION PAR FORMAT")
                            .font(.system(size: 10, weight: .heavy, design: .monospaced))
                            .foregroundStyle(GazetteTheme.muted(for: colorScheme))

                        ForEach(categoryBreakdown, id: \.category) { item in
                            VStack(alignment: .leading, spacing: 5) {
                                HStack {
                                    HStack(spacing: 6) {
                                        Circle()
                                            .fill(item.category.barColor(for: colorScheme))
                                            .frame(width: 7, height: 7)

                                        Text(item.category.title)
                                            .font(.system(size: 12, weight: .bold, design: .default))
                                            .foregroundStyle(GazetteTheme.text(for: colorScheme))
                                    }

                                    Spacer()

                                    Text("\(item.hours)h (\(item.percent)%)")
                                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                                        .foregroundStyle(GazetteTheme.muted(for: colorScheme))
                                }

                                GeometryReader { geo in
                                    ZStack(alignment: .leading) {
                                        Capsule()
                                            .fill(GazetteTheme.surface2(for: colorScheme))
                                            .frame(height: 7)

                                        Capsule()
                                            .fill(item.category.barColor(for: colorScheme))
                                            .frame(width: max(7, geo.size.width * CGFloat(item.percent) / 100), height: 7)
                                    }
                                }
                                .frame(height: 7)
                            }
                        }
                    }
                    .padding(14)
                    .background(GazetteTheme.surface(for: colorScheme))
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(GazetteTheme.border(for: colorScheme), lineWidth: 1)
                    )
                }
                .padding(16)
            }
            .background(GazetteTheme.bg(for: colorScheme))
            .navigationTitle("Statistiques")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Fermer") {
                        dismiss()
                    }
                    .font(.system(size: 13, weight: .bold))
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    private struct CategoryStat {
        let category: CourseCategory
        let minutes: Int
        let hours: Int
        let percent: Int
    }

    private var categoryBreakdown: [CategoryStat] {
        guard totalMinutes > 0 else { return [] }

        return CourseCategory.allCases.compactMap { cat in
            let catEvents = analyzedEvents.filter { $0.category == cat }
            let mins = catEvents.reduce(0) { $0 + $1.durationMinutes }
            guard mins > 0 else { return nil }
            let pct = Int(Double(mins) / Double(totalMinutes) * 100)
            return CategoryStat(category: cat, minutes: mins, hours: mins / 60, percent: pct)
        }.sorted { $0.minutes > $1.minutes }
    }
}
