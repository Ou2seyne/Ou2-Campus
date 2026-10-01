import SwiftUI

public struct ExamRadarSheet: View {
    @Bindable var store = ScheduleStore.shared
    @Environment(\.dismiss) var dismiss
    @Environment(\.colorScheme) var colorScheme

    private var exams: [ScheduleEvent] {
        store.events.filter { event in
            event.category == .exam ||
            event.summary.localizedCaseInsensitiveContains("ds") ||
            event.summary.localizedCaseInsensitiveContains("exam") ||
            event.summary.localizedCaseInsensitiveContains("partiel") ||
            event.summary.localizedCaseInsensitiveContains("contrôle")
        }.sorted { $0.dtstart < $1.dtstart }
    }

    private var upcomingExams: [ScheduleEvent] {
        let now = Date()
        return exams.filter { $0.dtend >= now }
    }

    private var pastExams: [ScheduleEvent] {
        let now = Date()
        return exams.filter { $0.dtend < now }
    }

    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    // Header héro
                    HStack(spacing: 12) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .fill(Color(hex: colorScheme == .dark ? "#200A0A" : "#FEE2E2"))
                                .frame(width: 44, height: 44)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                                        .stroke(Color(hex: colorScheme == .dark ? "#F87171" : "#B91C1C"), lineWidth: 1.5)
                                )

                            Image(systemName: "exclamationmark.triangle.fill")
                                .font(.system(size: 20, weight: .bold))
                                .foregroundStyle(Color(hex: colorScheme == .dark ? "#F87171" : "#B91C1C"))
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text("RADAR DES ÉVALUATIONS")
                                .font(.system(size: 10, weight: .heavy, design: .monospaced))
                                .foregroundStyle(Color(hex: colorScheme == .dark ? "#F87171" : "#B91C1C"))

                            Text("\(upcomingExams.count) épreuve\(upcomingExams.count > 1 ? "s" : "") à venir")
                                .font(.system(size: 16, weight: .heavy, design: .default))
                                .foregroundStyle(GazetteTheme.text(for: colorScheme))

                            Text("Anticipez vos révisions et partiels")
                                .font(.system(size: 11))
                                .foregroundStyle(GazetteTheme.muted(for: colorScheme))
                        }
                    }
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(GazetteTheme.surface(for: colorScheme))
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(GazetteTheme.border(for: colorScheme), lineWidth: 1)
                    )

                    // Liste des examens à venir
                    VStack(alignment: .leading, spacing: 8) {
                        Text("ÉVALUATIONS À VENIR")
                            .font(.system(size: 10, weight: .heavy, design: .monospaced))
                            .foregroundStyle(GazetteTheme.muted(for: colorScheme))

                        if upcomingExams.isEmpty {
                            Text("Aucun contrôle ni examen programmé prochainement.")
                                .font(.system(size: 12))
                                .foregroundStyle(GazetteTheme.muted(for: colorScheme))
                                .padding(14)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(GazetteTheme.surface(for: colorScheme))
                                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                                        .stroke(GazetteTheme.border(for: colorScheme), lineWidth: 1)
                                )
                        } else {
                            ForEach(upcomingExams) { exam in
                                ExamCard(exam: exam)
                            }
                        }
                    }

                    // Évaluations passées
                    if !pastExams.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("ÉPREUVES ACHEVÉES")
                                .font(.system(size: 10, weight: .heavy, design: .monospaced))
                                .foregroundStyle(GazetteTheme.muted(for: colorScheme))

                            ForEach(pastExams) { exam in
                                ExamCard(exam: exam, isPast: true)
                            }
                        }
                    }
                }
                .padding(16)
            }
            .background(GazetteTheme.bg(for: colorScheme))
            .navigationTitle("Radar Examens")
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
}

private struct ExamCard: View {
    let exam: ScheduleEvent
    var isPast: Bool = false
    @Environment(\.colorScheme) var colorScheme

    private var daysRemaining: Int {
        Calendar.current.dateComponents([.day], from: Calendar.current.startOfDay(for: Date()), to: Calendar.current.startOfDay(for: exam.dtstart)).day ?? 0
    }

    public var body: some View {
        HStack(spacing: 0) {
            // Barre gauche colorée
            Rectangle()
                .fill(Color(hex: colorScheme == .dark ? "#F87171" : "#B91C1C"))
                .frame(width: 4)

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(exam.startDateFormatted)
                        .font(.system(size: 11, weight: .heavy, design: .monospaced))
                        .foregroundStyle(GazetteTheme.text(for: colorScheme))

                    Spacer()

                    if !isPast {
                        let text = daysRemaining == 0 ? "AUJOURD'HUI" : (daysRemaining == 1 ? "DEMAIN" : "DANS \(daysRemaining) JOURS")
                        Text(text)
                            .font(.system(size: 9, weight: .heavy, design: .monospaced))
                            .padding(.horizontal, 6)
                            .padding(.vertical, 3)
                            .background(Color(hex: colorScheme == .dark ? "#200A0A" : "#FEE2E2"))
                            .foregroundStyle(Color(hex: colorScheme == .dark ? "#F87171" : "#B91C1C"))
                            .clipShape(Capsule())
                    }
                }

                Text(exam.cleanTitle)
                    .font(.system(size: 14, weight: .bold, design: .default))
                    .foregroundStyle(GazetteTheme.text(for: colorScheme))

                HStack(spacing: 8) {
                    Text("\(exam.startTimeFormatted) – \(exam.endTimeFormatted)")
                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                        .foregroundStyle(GazetteTheme.muted(for: colorScheme))

                    if !exam.room.isEmpty {
                        HStack(spacing: 3) {
                            Image(systemName: "mappin.fill")
                                .font(.system(size: 9))
                            Text("Salle \(exam.room)")
                        }
                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                        .foregroundStyle(GazetteTheme.accent(for: colorScheme))
                    }
                }
            }
            .padding(12)
        }
        .background(
            Color(hex: colorScheme == .dark ? "#1A1010" : "#FFF5F5")
        )
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(Color(hex: colorScheme == .dark ? "#3A1A1A" : "#FECACA"), lineWidth: 1)
        )
        .opacity(isPast ? 0.6 : 1.0)
    }
}
