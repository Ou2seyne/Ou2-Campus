import SwiftUI

public struct CourseCardView: View {
    let event: ScheduleEvent
    var hasHomework: Bool = false
    let onTap: () -> Void

    @Environment(\.colorScheme) var colorScheme
    @State private var copiedRoom: Bool = false

    public var body: some View {
        Button(action: onTap) {
            VStack(spacing: 0) {
                // Barre de progression en haut si le cours est en cours
                if event.isOngoing() {
                    GeometryReader { geo in
                        Rectangle()
                            .fill(GazetteTheme.livePulse(for: colorScheme))
                            .frame(width: max(4, geo.size.width * CGFloat(progressPercent) / 100), height: 3)
                    }
                    .frame(height: 3)
                }

                HStack(spacing: 0) {
                    // Barre latérale gauche 4px
                    Rectangle()
                        .fill(event.category.barColor(for: colorScheme))
                        .frame(width: 4)

                    // Contenu principal de la carte
                    VStack(alignment: .leading, spacing: 8) {
                        // Ligne supérieure : Horaires + badges d'état et de catégorie
                        HStack(alignment: .center, spacing: 6) {
                            // Horaires (Geist Mono tabular-nums)
                            HStack(spacing: 3) {
                                Text(event.startTimeFormatted)
                                Text("–")
                                    .foregroundStyle(GazetteTheme.muted(for: colorScheme))
                                Text(event.endTimeFormatted)
                            }
                            .font(.system(size: 13, weight: .heavy, design: .monospaced))
                            .foregroundStyle(
                                event.isOngoing()
                                    ? GazetteTheme.liveText(for: colorScheme)
                                    : GazetteTheme.text(for: colorScheme)
                            )

                            Text("\(event.durationMinutes) min")
                                .font(.system(size: 11, weight: .medium, design: .monospaced))
                                .foregroundStyle(GazetteTheme.muted(for: colorScheme))

                            // Badge "EN COURS"
                            if event.isOngoing() {
                                HStack(spacing: 4) {
                                    Circle()
                                        .fill(GazetteTheme.livePulse(for: colorScheme))
                                        .frame(width: 5, height: 5)
                                    Text("EN COURS · \(minutesRemaining) MIN")
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
                            } else if isPast {
                                Text("TERMINÉ")
                                    .font(.system(size: 9, weight: .bold, design: .monospaced))
                                    .padding(.horizontal, 5)
                                    .padding(.vertical, 1.5)
                                    .background(GazetteTheme.surface2(for: colorScheme))
                                    .foregroundStyle(GazetteTheme.muted(for: colorScheme))
                                    .overlay(
                                        Rectangle()
                                            .stroke(GazetteTheme.border2(for: colorScheme), lineWidth: 1)
                                    )
                            }

                            Spacer()

                            // Badges de droite
                            HStack(spacing: 4) {
                                if event.category == .exam {
                                    Text("ÉVALUATION")
                                        .font(.system(size: 9, weight: .heavy, design: .monospaced))
                                        .padding(.horizontal, 5)
                                        .padding(.vertical, 1.5)
                                        .background(Color(hex: colorScheme == .dark ? "#200A0A" : "#FEE2E2"))
                                        .foregroundStyle(Color(hex: colorScheme == .dark ? "#F87171" : "#B91C1C"))
                                        .overlay(
                                            Rectangle()
                                                .stroke(Color(hex: colorScheme == .dark ? "#F87171" : "#B91C1C"), lineWidth: 1)
                                        )
                                }

                                Text(event.category.shortLabel)
                                    .font(.system(size: 10, weight: .heavy, design: .monospaced))
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(event.category.barColor(for: colorScheme))
                                    .foregroundStyle(.white)

                                if let group = event.subGroup, !group.isEmpty {
                                    Text(group)
                                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                                        .padding(.horizontal, 5)
                                        .padding(.vertical, 2)
                                        .background(colorScheme == .dark ? Color.white.opacity(0.12) : Color.black.opacity(0.08))
                                        .foregroundStyle(GazetteTheme.text(for: colorScheme))
                                }
                            }
                        }

                        // Titre du cours (Bricolage Grotesque dense)
                        Text(event.cleanTitle)
                            .font(.system(size: 15, weight: .heavy, design: .default))
                            .tracking(-0.3)
                            .foregroundStyle(GazetteTheme.text(for: colorScheme))
                            .multilineTextAlignment(.leading)
                            .lineLimit(2)
                            .fixedSize(horizontal: false, vertical: true)

                        // Métadonnées : Salle tactile + Enseignant + Devoir
                        HStack(spacing: 8) {
                            if !event.room.isEmpty || !event.location.isEmpty {
                                let displayRoom = event.room.isEmpty ? event.location : event.room
                                Button {
                                    UIPasteboard.general.string = displayRoom
                                    let impact = UINotificationFeedbackGenerator()
                                    impact.notificationOccurred(.success)
                                    copiedRoom = true
                                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                                        copiedRoom = false
                                    }
                                } label: {
                                    HStack(spacing: 4) {
                                        Image(systemName: "mappin.fill")
                                            .font(.system(size: 9))
                                            .foregroundStyle(GazetteTheme.accent(for: colorScheme))

                                        Text(displayRoom)
                                            .font(.system(size: 10, weight: .bold, design: .monospaced))

                                        Image(systemName: copiedRoom ? "checkmark" : "doc.on.doc")
                                            .font(.system(size: 8))
                                            .foregroundStyle(copiedRoom ? Color.green : GazetteTheme.muted(for: colorScheme))
                                    }
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2.5)
                                    .background(GazetteTheme.surface(for: colorScheme))
                                    .foregroundStyle(GazetteTheme.text(for: colorScheme))
                                    .overlay(
                                        Rectangle()
                                            .stroke(GazetteTheme.border2(for: colorScheme), lineWidth: 1)
                                    )
                                }
                                .buttonStyle(.plain)
                            }

                            if !event.teacher.isEmpty {
                                HStack(spacing: 3) {
                                    Image(systemName: "person.fill")
                                        .font(.system(size: 9))
                                    Text(event.teacher)
                                        .font(.system(size: 11, weight: .medium, design: .default))
                                        .lineLimit(1)
                                }
                                .foregroundStyle(GazetteTheme.muted(for: colorScheme))
                            }

                            Spacer()

                            if hasHomework {
                                HStack(spacing: 3) {
                                    Image(systemName: "book.fill")
                                        .font(.system(size: 9))
                                    Text("Devoir")
                                        .font(.system(size: 10, weight: .heavy, design: .monospaced))
                                }
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color(hex: colorScheme == .dark ? "#180E2E" : "#EDE9FE"))
                                .foregroundStyle(Color(hex: colorScheme == .dark ? "#C4B5FD" : "#4C1D95"))
                                .overlay(
                                    Rectangle()
                                        .stroke(Color(hex: colorScheme == .dark ? "#A78BFA" : "#7C3AED"), lineWidth: 1)
                                )
                            }
                        }
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                }
            }
            .background(event.category.bgColor(for: colorScheme))
            .overlay(
                Rectangle()
                    .stroke(
                        event.isOngoing()
                            ? GazetteTheme.liveBar(for: colorScheme)
                            : GazetteTheme.border(for: colorScheme),
                        lineWidth: event.isOngoing() ? 1.5 : 1
                    )
            )
            .opacity(isPast ? 0.70 : 1.0)
        }
        .buttonStyle(.plain)
        .tactileHaptic()
    }

    private var isPast: Bool {
        Calendar.current.isDateInToday(event.dtstart) && Date() > event.dtend
    }

    private var progressPercent: Double {
        guard event.isOngoing() else { return 0 }
        let total = event.dtend.timeIntervalSince(event.dtstart)
        guard total > 0 else { return 0 }
        let elapsed = Date().timeIntervalSince(event.dtstart)
        return min(100, max(2, (elapsed / total) * 100))
    }

    private var minutesRemaining: Int {
        guard event.isOngoing() else { return 0 }
        return max(1, Int(event.dtend.timeIntervalSinceNow / 60))
    }
}
