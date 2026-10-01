import SwiftUI

public struct TimelineView: View {
    @Bindable var store = ScheduleStore.shared
    let onSelectEvent: (ScheduleEvent) -> Void

    @Environment(\.colorScheme) var colorScheme
    @State private var now = Date()

    public var body: some View {
        VStack(spacing: 0) {
            if store.dayEvents.isEmpty {
                // Journée sans cours avec bouton d'action UX
                VStack(spacing: 14) {
                    Image(systemName: "cup.and.saucer.fill")
                        .font(.system(size: 34))
                        .foregroundStyle(Color.orange.opacity(0.85))

                    VStack(spacing: 4) {
                        Text("Aucun cours programmé")
                            .font(.system(size: 16, weight: .bold, design: .rounded))
                            .foregroundStyle(GazetteTheme.text(for: colorScheme))

                        Text(emptyStateSubtitle)
                            .font(.system(size: 13))
                            .foregroundStyle(GazetteTheme.muted(for: colorScheme))
                            .multilineTextAlignment(.center)
                    }

                    // Boutons d'action UX pour naviguer rapidement
                    HStack(spacing: 8) {
                        if !Calendar.current.isDateInToday(store.selectedDate) {
                            Button {
                                withAnimation(.snappy(duration: 0.2)) {
                                    store.goToToday()
                                }
                                let impact = UIImpactFeedbackGenerator(style: .light)
                                impact.impactOccurred()
                            } label: {
                                Text("Aujourd'hui")
                                    .font(.system(size: 12, weight: .semibold))
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(GazetteTheme.accentDim(for: colorScheme))
                                    .foregroundStyle(GazetteTheme.accent(for: colorScheme))
                                    .clipShape(Capsule())
                            }
                            .buttonStyle(.plain)
                        }

                        Button {
                            withAnimation(.snappy(duration: 0.2)) {
                                store.goToNextDay()
                            }
                            let impact = UIImpactFeedbackGenerator(style: .light)
                            impact.impactOccurred()
                        } label: {
                            HStack(spacing: 4) {
                                Text("Jour suivant")
                                Image(systemName: "chevron.right")
                                    .font(.system(size: 10, weight: .bold))
                            }
                            .font(.system(size: 12, weight: .semibold))
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(GazetteTheme.surface2(for: colorScheme))
                            .foregroundStyle(GazetteTheme.text(for: colorScheme))
                            .clipShape(Capsule())
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(.top, 4)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 36)
                .padding(.horizontal, 16)
                .background(GazetteTheme.surface(for: colorScheme))
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .stroke(GazetteTheme.border(for: colorScheme), lineWidth: 1)
                )
            } else {
                // Affichage Timeline style Pronote / Papillon
                VStack(spacing: 12) {
                    let events = store.dayEvents
                    ForEach(Array(events.enumerated()), id: \.element.id) { index, event in
                        VStack(spacing: 10) {
                            // Indicateur de l'heure actuelle ("Maintenant") si c'est aujourd'hui et avant ce cours
                            if isToday && shouldShowNowLine(before: event, previousEvent: index > 0 ? events[index - 1] : nil) {
                                nowIndicatorLine
                            }

                            // Carte de cours avec axe horaire sur la gauche
                            PapillonCourseRow(
                                event: event,
                                hasHomework: store.homeworkItems.contains {
                                    $0.courseTitle.lowercased() == event.cleanTitle.lowercased() && !$0.isDone
                                },
                                onTap: { onSelectEvent(event) }
                            )

                            // Insertion automatique d'une pause / temps libre s'il y a un trou avant le cours suivant
                            if index < events.count - 1 {
                                let nextEvent = events[index + 1]
                                let gapMinutes = Int(nextEvent.dtstart.timeIntervalSince(event.dtend) / 60)
                                if gapMinutes >= 20 {
                                    PapillonBreakRow(
                                        startTime: event.endTimeFormatted,
                                        endTime: nextEvent.startTimeFormatted,
                                        durationMinutes: gapMinutes
                                    )
                                }
                            }
                        }
                    }

                    // Si tous les cours sont passés aujourd'hui
                    if isToday && events.allSatisfy({ $0.isPast(at: now) }) {
                        nowIndicatorLine
                    }
                }
            }
        }
        .onAppear {
            now = Date()
        }
    }

    private var isToday: Bool {
        Calendar.current.isDateInToday(store.selectedDate)
    }

    private func shouldShowNowLine(before event: ScheduleEvent, previousEvent: ScheduleEvent?) -> Bool {
        if let prev = previousEvent {
            return now >= prev.dtend && now < event.dtstart
        } else {
            return now < event.dtstart
        }
    }

    private var nowIndicatorLine: some View {
        HStack(spacing: 8) {
            Text(nowFormatted)
                .font(.system(size: 11, weight: .heavy, design: .monospaced))
                .foregroundStyle(Color.red)
                .frame(width: 52, alignment: .trailing)

            Circle()
                .fill(Color.red)
                .frame(width: 7, height: 7)

            Rectangle()
                .fill(Color.red.opacity(0.8))
                .frame(height: 1.5)

            Text("Maintenant")
                .font(.system(size: 10, weight: .bold))
                .foregroundStyle(Color.red)
                .padding(.trailing, 4)
        }
        .padding(.vertical, 2)
    }

    private var nowFormatted: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: now)
    }

    private var emptyStateSubtitle: String {
        let weekday = Calendar.current.component(.weekday, from: store.selectedDate)
        if weekday == 1 || weekday == 7 {
            return "Bon week-end ! Reposez-vous bien pour attaquer la semaine."
        }
        return "Profitez de cette journée libre pour réviser ou vous reposer !"
    }
}

// Ligne de cours individuelle style Pronote / Papillon
private struct PapillonCourseRow: View {
    let event: ScheduleEvent
    let hasHomework: Bool
    let onTap: () -> Void

    @Environment(\.colorScheme) var colorScheme

    public var body: some View {
        Button(action: {
            let impact = UIImpactFeedbackGenerator(style: .light)
            impact.impactOccurred()
            onTap()
        }) {
            HStack(alignment: .top, spacing: 10) {
                // Colonne de gauche : Horaires (Pronote / Papillon)
                VStack(alignment: .trailing, spacing: 3) {
                    Text(event.startTimeFormatted)
                        .font(.system(size: 13, weight: .bold, design: .monospaced))
                        .foregroundStyle(
                            event.isOngoing()
                                ? GazetteTheme.accent(for: colorScheme)
                                : (isPast ? GazetteTheme.muted(for: colorScheme) : GazetteTheme.text(for: colorScheme))
                        )

                    // Ligne verticale de liaison
                    Rectangle()
                        .fill(
                            event.isOngoing()
                                ? GazetteTheme.accent(for: colorScheme)
                                : GazetteTheme.border2(for: colorScheme).opacity(0.5)
                        )
                        .frame(width: 2, height: 26)

                    Text(event.endTimeFormatted)
                        .font(.system(size: 12, weight: .semibold, design: .monospaced))
                        .foregroundStyle(GazetteTheme.muted(for: colorScheme))

                    Text(ScheduleStore.formatDuration(minutes: event.durationMinutes))
                        .font(.system(size: 10, weight: .medium, design: .monospaced))
                        .foregroundStyle(GazetteTheme.muted2(for: colorScheme))
                        .padding(.top, 1)
                }
                .frame(width: 52)
                .padding(.top, 4)

                // Carte du cours (style Papillon / Gazette Structurée)
                HStack(spacing: 0) {
                    // Barre latérale colorée 4px (Gazette Structurée)
                    Rectangle()
                        .fill(event.category.barColor(for: colorScheme))
                        .frame(width: 4)

                    VStack(alignment: .leading, spacing: 8) {
                        // Header de carte : Badges + Statut
                        HStack(spacing: 6) {
                            // Badge Catégorie (CM, TD, TP, DS)
                            Text(event.category.shortLabel)
                                .font(.system(size: 10, weight: .heavy, design: .monospaced))
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2.5)
                                .background(event.category.barColor(for: colorScheme))
                                .foregroundStyle(.white)
                                .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))

                            if let group = event.subGroup, !group.isEmpty {
                                Text("Grp \(group)")
                                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2.5)
                                    .background(GazetteTheme.surface2(for: colorScheme))
                                    .foregroundStyle(GazetteTheme.text(for: colorScheme))
                                    .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
                            }

                            Spacer()

                            if event.isOngoing() {
                                HStack(spacing: 4) {
                                    Circle()
                                        .fill(Color.green)
                                        .frame(width: 6, height: 6)
                                    Text("EN COURS")
                                        .font(.system(size: 9, weight: .heavy, design: .monospaced))
                                        .foregroundStyle(Color.green)
                                }
                                .padding(.horizontal, 7)
                                .padding(.vertical, 3)
                                .background(Color.green.opacity(0.12))
                                .clipShape(Capsule())
                            } else if event.category == .exam {
                                HStack(spacing: 3) {
                                    Image(systemName: "exclamationmark.triangle.fill")
                                        .font(.system(size: 9))
                                    Text("ÉVALUATION")
                                        .font(.system(size: 9, weight: .heavy, design: .monospaced))
                                }
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2.5)
                                .background(Color.red.opacity(0.12))
                                .foregroundStyle(Color.red)
                                .clipShape(Capsule())
                            } else if isPast {
                                Text("Terminé")
                                    .font(.system(size: 9, weight: .semibold))
                                    .foregroundStyle(GazetteTheme.muted2(for: colorScheme))
                            }
                        }

                        // Titre du cours
                        Text(event.cleanTitle)
                            .font(.system(size: 15, weight: .bold, design: .default))
                            .foregroundStyle(
                                isPast
                                    ? GazetteTheme.muted(for: colorScheme)
                                    : GazetteTheme.text(for: colorScheme)
                            )
                            .multilineTextAlignment(.leading)
                            .lineLimit(2)

                        // Footer : Salle mise en valeur + Enseignant
                        HStack(spacing: 8) {
                            // Salle mise en évidence (Information #1 pour les étudiants)
                            if !event.room.isEmpty || !event.location.isEmpty {
                                let roomText = event.room.isEmpty ? event.location : event.room
                                HStack(spacing: 4) {
                                    Image(systemName: "mappin.circle.fill")
                                        .font(.system(size: 11))
                                        .foregroundStyle(event.category.barColor(for: colorScheme))

                                    Text(roomText)
                                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                                }
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3.5)
                                .background(GazetteTheme.surface2(for: colorScheme))
                                .foregroundStyle(GazetteTheme.text(for: colorScheme))
                                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                            }

                            if !event.teacher.isEmpty {
                                HStack(spacing: 3) {
                                    Image(systemName: "person.fill")
                                        .font(.system(size: 10))
                                    Text(event.teacher)
                                        .font(.system(size: 11, weight: .medium))
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
                                        .font(.system(size: 10, weight: .bold))
                                }
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2.5)
                                .background(Color.purple.opacity(0.15))
                                .foregroundStyle(Color.purple)
                                .clipShape(Capsule())
                            }
                        }
                    }
                    .padding(12)
                }
                .background(
                    event.isOngoing()
                        ? event.category.bgColor(for: colorScheme).opacity(0.85)
                        : GazetteTheme.surface(for: colorScheme)
                )
                .opacity(isPast ? 0.68 : 1.0)
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .stroke(
                            event.isOngoing()
                                ? event.category.barColor(for: colorScheme)
                                : GazetteTheme.border(for: colorScheme),
                            lineWidth: event.isOngoing() ? 1.5 : 1
                        )
                )
            }
        }
        .buttonStyle(.plain)
    }

    private var isPast: Bool {
        Calendar.current.isDateInToday(event.dtstart) && Date() > event.dtend
    }
}

// Ligne de pause / trou d'emploi du temps (style Papillon / Pronote)
private struct PapillonBreakRow: View {
    let startTime: String
    let endTime: String
    let durationMinutes: Int

    @Environment(\.colorScheme) var colorScheme

    private var isLunchTime: Bool {
        durationMinutes >= 40
    }

    public var body: some View {
        HStack(alignment: .center, spacing: 10) {
            // Heures de pause
            VStack(alignment: .trailing, spacing: 1) {
                Text(startTime)
                    .font(.system(size: 10, weight: .semibold, design: .monospaced))
                    .foregroundStyle(GazetteTheme.muted(for: colorScheme))
                Text("↓")
                    .font(.system(size: 8))
                    .foregroundStyle(GazetteTheme.muted2(for: colorScheme))
                Text(endTime)
                    .font(.system(size: 10, weight: .semibold, design: .monospaced))
                    .foregroundStyle(GazetteTheme.muted(for: colorScheme))
            }
            .frame(width: 52)

            // Bloc de pause avec bordure discrète
            HStack(spacing: 8) {
                Image(systemName: isLunchTime ? "fork.knife" : "cup.and.saucer")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(isLunchTime ? Color.orange : GazetteTheme.muted(for: colorScheme))

                Text(isLunchTime ? "Pause déjeuner" : "Temps libre")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(GazetteTheme.text(for: colorScheme))

                Text("(\(ScheduleStore.formatDuration(minutes: durationMinutes)))")
                    .font(.system(size: 11, weight: .medium, design: .monospaced))
                    .foregroundStyle(GazetteTheme.muted(for: colorScheme))

                Spacer()
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(GazetteTheme.surface2(for: colorScheme).opacity(0.6))
            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .strokeBorder(
                        GazetteTheme.border(for: colorScheme).opacity(0.7),
                        style: StrokeStyle(lineWidth: 1, dash: [4, 4])
                    )
            )
        }
    }
}
