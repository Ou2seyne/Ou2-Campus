import SwiftUI

public struct DailyBriefingCard: View {
    let events: [ScheduleEvent]
    let homeworks: [HomeworkItem]
    let onSelectEvent: (ScheduleEvent) -> Void
    let onOpenHomework: () -> Void
    let onOpenExamRadar: () -> Void

    @Environment(\.colorScheme) var colorScheme

    public var body: some View {
        VStack(spacing: 0) {
            // Masthead / En-tête éditoriale
            HStack(spacing: 8) {
                HStack(spacing: 4) {
                    Image(systemName: "sparkles")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(Color.orange)

                    Text("BRIEFING EXPRESS")
                        .font(.system(size: 9, weight: .heavy, design: .monospaced))
                        .tracking(0.5)
                }
                .padding(.horizontal, 5)
                .padding(.vertical, 2)
                .background(GazetteTheme.surface(for: colorScheme))
                .foregroundStyle(GazetteTheme.text(for: colorScheme))
                .overlay(
                    Rectangle()
                        .stroke(GazetteTheme.border2(for: colorScheme), lineWidth: 1)
                )

                Spacer()

                // Résumé chiffré
                HStack(spacing: 4) {
                    Text("\(events.count) cours")
                        .font(.system(size: 11, weight: .heavy, design: .monospaced))
                        .foregroundStyle(GazetteTheme.text(for: colorScheme))

                    Text("·")
                        .foregroundStyle(GazetteTheme.border2(for: colorScheme))

                    Text("\(totalDurationFormatted) au total")
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(GazetteTheme.muted(for: colorScheme))
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(GazetteTheme.surface2(for: colorScheme))
            .overlay(
                Rectangle()
                    .frame(height: 1)
                    .foregroundStyle(GazetteTheme.border(for: colorScheme)),
                alignment: .bottom
            )

            // Corps du briefing
            if events.isEmpty {
                // Journée sans cours
                HStack(spacing: 12) {
                    ZStack {
                        Rectangle()
                            .fill(GazetteTheme.surface2(for: colorScheme))
                            .frame(width: 36, height: 36)
                            .overlay(
                                Rectangle()
                                    .stroke(GazetteTheme.border2(for: colorScheme), lineWidth: 1)
                            )

                        Image(systemName: "cup.and.saucer.fill")
                            .font(.system(size: 16))
                            .foregroundStyle(Color.orange)
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Journée sans cours programmé")
                            .font(.system(size: 13, weight: .heavy, design: .default))
                            .foregroundStyle(GazetteTheme.text(for: colorScheme))

                        Text("Profitez-en pour réviser, avancer vos devoirs ou vous reposer !")
                            .font(.system(size: 11, weight: .regular))
                            .foregroundStyle(GazetteTheme.muted(for: colorScheme))
                    }
                    Spacer()
                }
                .padding(12)
            } else {
                VStack(spacing: 10) {
                    // 1. Cours en direct (si présent)
                    if let ongoing = ongoingEvent {
                        Button {
                            onSelectEvent(ongoing)
                        } label: {
                            VStack(alignment: .leading, spacing: 6) {
                                HStack {
                                    HStack(spacing: 4) {
                                        Circle()
                                            .fill(GazetteTheme.livePulse(for: colorScheme))
                                            .frame(width: 5, height: 5)
                                        Text("EN COURS")
                                            .font(.system(size: 9, weight: .heavy, design: .monospaced))
                                    }
                                    .padding(.horizontal, 5)
                                    .padding(.vertical, 2)
                                    .background(GazetteTheme.liveBg(for: colorScheme))
                                    .foregroundStyle(GazetteTheme.liveText(for: colorScheme))
                                    .overlay(
                                        Rectangle()
                                            .stroke(GazetteTheme.liveBar(for: colorScheme), lineWidth: 1)
                                    )

                                    Spacer()

                                    Text("\(ongoing.startTimeFormatted) → \(ongoing.endTimeFormatted)")
                                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                                        .foregroundStyle(GazetteTheme.text(for: colorScheme))
                                }

                                Text(ongoing.cleanTitle)
                                    .font(.system(size: 14, weight: .heavy, design: .default))
                                    .foregroundStyle(GazetteTheme.text(for: colorScheme))
                                    .multilineTextAlignment(.leading)
                                    .lineLimit(1)

                                HStack(spacing: 8) {
                                    if !ongoing.room.isEmpty {
                                        HStack(spacing: 3) {
                                            Image(systemName: "mappin.fill")
                                                .font(.system(size: 9))
                                            Text(ongoing.room)
                                                .font(.system(size: 10, weight: .bold, design: .monospaced))
                                        }
                                        .foregroundStyle(GazetteTheme.accent(for: colorScheme))
                                    }

                                    if !ongoing.teacher.isEmpty {
                                        Text(ongoing.teacher)
                                            .font(.system(size: 10))
                                            .foregroundStyle(GazetteTheme.muted(for: colorScheme))
                                    }
                                }
                            }
                            .padding(10)
                            .background(ongoing.category.bgColor(for: colorScheme))
                            .overlay(
                                Rectangle()
                                    .stroke(ongoing.category.barColor(for: colorScheme), lineWidth: 1)
                            )
                        }
                        .buttonStyle(.plain)
                    } else if let upcoming = upcomingEvent {
                        // Prochain cours
                        Button {
                            onSelectEvent(upcoming)
                        } label: {
                            HStack(spacing: 10) {
                                Text(upcoming.startTimeFormatted)
                                    .font(.system(size: 13, weight: .heavy, design: .monospaced))
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 3)
                                    .background(GazetteTheme.surface2(for: colorScheme))
                                    .foregroundStyle(GazetteTheme.text(for: colorScheme))
                                    .overlay(
                                        Rectangle()
                                            .stroke(GazetteTheme.border(for: colorScheme), lineWidth: 1)
                                    )

                                VStack(alignment: .leading, spacing: 2) {
                                    HStack(spacing: 4) {
                                        Text("PROCHAIN COURS")
                                            .font(.system(size: 9, weight: .heavy, design: .monospaced))
                                            .foregroundStyle(GazetteTheme.muted(for: colorScheme))

                                        if !upcoming.room.isEmpty {
                                            Text("· Salle \(upcoming.room)")
                                                .font(.system(size: 9, weight: .bold, design: .monospaced))
                                                .foregroundStyle(GazetteTheme.accent(for: colorScheme))
                                        }
                                    }

                                    Text(upcoming.cleanTitle)
                                        .font(.system(size: 13, weight: .bold, design: .default))
                                        .foregroundStyle(GazetteTheme.text(for: colorScheme))
                                        .lineLimit(1)
                                }

                                Spacer()

                                Image(systemName: "chevron.right")
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundStyle(GazetteTheme.muted(for: colorScheme))
                            }
                            .padding(10)
                            .background(GazetteTheme.surface(for: colorScheme))
                            .overlay(
                                Rectangle()
                                    .stroke(GazetteTheme.border(for: colorScheme), lineWidth: 1)
                            )
                        }
                        .buttonStyle(.plain)
                    }

                    // 2. Grille de statistiques horizontales (Pause déj + Devoirs + Examens)
                    HStack(spacing: 0) {
                        if let lunch = lunchBreak {
                            HStack(spacing: 4) {
                                Image(systemName: "fork.knife")
                                    .font(.system(size: 9))
                                    .foregroundStyle(Color.orange)
                                Text("Pause : \(lunch)")
                                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                                    .foregroundStyle(GazetteTheme.text(for: colorScheme))
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 6)
                        }

                        if urgentHomeworkCount > 0 {
                            Button(action: onOpenHomework) {
                                HStack(spacing: 4) {
                                    Image(systemName: "book.fill")
                                        .font(.system(size: 9))
                                        .foregroundStyle(Color.purple)
                                    Text("\(urgentHomeworkCount) devoir\(urgentHomeworkCount > 1 ? "s" : "")")
                                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                                        .foregroundStyle(GazetteTheme.text(for: colorScheme))
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 6)
                            }
                            .buttonStyle(.plain)
                        }

                        if hasExamToday {
                            Button(action: onOpenExamRadar) {
                                HStack(spacing: 4) {
                                    Image(systemName: "exclamationmark.triangle.fill")
                                        .font(.system(size: 9))
                                        .foregroundStyle(Color.red)
                                    Text("Évaluation aujourd'hui")
                                        .font(.system(size: 10, weight: .heavy, design: .monospaced))
                                        .foregroundStyle(Color.red)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 6)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .background(GazetteTheme.surface2(for: colorScheme))
                    .overlay(
                        Rectangle()
                            .stroke(GazetteTheme.border(for: colorScheme), lineWidth: 1)
                    )
                }
                .padding(10)
            }
        }
        .background(GazetteTheme.surface(for: colorScheme))
        .overlay(
            Rectangle()
                .stroke(GazetteTheme.border2(for: colorScheme), lineWidth: 1)
        )
    }

    private var ongoingEvent: ScheduleEvent? {
        events.first { $0.isOngoing() }
    }

    private var upcomingEvent: ScheduleEvent? {
        events.first { $0.isUpcoming() }
    }

    private var totalDurationFormatted: String {
        let total = events.reduce(0) { $0 + $1.durationMinutes }
        let h = total / 60
        let m = total % 60
        return m > 0 ? "\(h)h\(String(format: "%02d", m))" : "\(h)h"
    }

    private var lunchBreak: String? {
        guard events.count >= 2 else { return nil }
        let sorted = events.sorted { $0.dtstart < $1.dtstart }
        for i in 0..<(sorted.count - 1) {
            let currEnd = sorted[i].dtend
            let nextStart = sorted[i + 1].dtstart
            let diff = Int(nextStart.timeIntervalSince(currEnd) / 60)
            let hour = Calendar.current.component(.hour, from: currEnd)
            if diff >= 45 && hour >= 11 && hour <= 14 {
                let formatter = DateFormatter()
                formatter.dateFormat = "HH:mm"
                return "\(formatter.string(from: currEnd)) → \(formatter.string(from: nextStart))"
            }
        }
        return nil
    }

    private var urgentHomeworkCount: Int {
        homeworks.filter { !$0.isDone }.count
    }

    private var hasExamToday: Bool {
        events.contains { $0.category == .exam }
    }
}
