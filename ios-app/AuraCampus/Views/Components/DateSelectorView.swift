import SwiftUI

public struct DateSelectorView: View {
    @Bindable var store = ScheduleStore.shared
    @Environment(\.colorScheme) var colorScheme

    public var body: some View {
        VStack(spacing: 8) {
            // Ligne de navigation de semaine (Mois + Sélecteur Jour/Semaine + Flèches)
            HStack(spacing: 6) {
                // Mois et Semaine
                HStack(spacing: 4) {
                    Text(currentMonthFormatted)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundStyle(GazetteTheme.text(for: colorScheme))
                        .lineLimit(1)

                    Text("S\(currentWeekOfYear)")
                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                        .padding(.horizontal, 5)
                        .padding(.vertical, 2)
                        .background(GazetteTheme.surface2(for: colorScheme))
                        .foregroundStyle(GazetteTheme.muted(for: colorScheme))
                        .clipShape(Capsule())
                }

                Spacer()

                // Bascule Jour / Semaine
                Picker("Vue", selection: $store.viewMode) {
                    Text("Jour").tag(ScheduleStore.ScheduleViewMode.day)
                    Text("Semaine").tag(ScheduleStore.ScheduleViewMode.week)
                }
                .pickerStyle(.segmented)
                .frame(width: 130)

                // Flèches navigation semaine
                HStack(spacing: 4) {
                    // Précédent
                    Button {
                        navigateWeek(by: -1)
                    } label: {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 10, weight: .bold))
                            .frame(width: 26, height: 26)
                            .background(GazetteTheme.surface2(for: colorScheme))
                            .foregroundStyle(GazetteTheme.text(for: colorScheme))
                            .clipShape(Circle())
                            .overlay(
                                Circle()
                                    .stroke(GazetteTheme.border(for: colorScheme), lineWidth: 1)
                            )
                    }
                    .buttonStyle(.plain)

                    // Suivant
                    Button {
                        navigateWeek(by: 1)
                    } label: {
                        Image(systemName: "chevron.right")
                            .font(.system(size: 10, weight: .bold))
                            .frame(width: 26, height: 26)
                            .background(GazetteTheme.surface2(for: colorScheme))
                            .foregroundStyle(GazetteTheme.text(for: colorScheme))
                            .clipShape(Circle())
                            .overlay(
                                Circle()
                                    .stroke(GazetteTheme.border(for: colorScheme), lineWidth: 1)
                            )
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 2)

            // Strip des jours de la semaine (Pronote / Papillon style)
            HStack(spacing: 6) {
                ForEach(weekDays, id: \.date) { day in
                    let isSelected = Calendar.current.isDate(day.date, inSameDayAs: store.selectedDate)
                    let isToday = Calendar.current.isDateInToday(day.date)

                    Button {
                        withAnimation(.snappy(duration: 0.2)) {
                            store.selectedDate = day.date
                            if store.viewMode == .week {
                                store.viewMode = .day
                            }
                        }
                        let impact = UIImpactFeedbackGenerator(style: .light)
                        impact.impactOccurred()
                    } label: {
                        VStack(spacing: 3) {
                            Text(day.initial)
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundStyle(
                                    isSelected
                                        ? Color.white
                                        : (isToday ? GazetteTheme.accent(for: colorScheme) : GazetteTheme.muted(for: colorScheme))
                                )

                            Text(day.dayNumber)
                                .font(.system(size: 15, weight: isSelected || isToday ? .heavy : .bold, design: .rounded))
                                .foregroundStyle(
                                    isSelected
                                        ? Color.white
                                        : GazetteTheme.text(for: colorScheme)
                                )

                            // Point(s) d'indicateur de cours (Pronote style)
                            if day.eventCount > 0 {
                                HStack(spacing: 2) {
                                    ForEach(0..<min(3, day.eventCount), id: \.self) { _ in
                                        Circle()
                                            .fill(
                                                isSelected
                                                    ? Color.white.opacity(0.9)
                                                    : (day.hasExam ? Color.red : (isToday ? GazetteTheme.accent(for: colorScheme) : GazetteTheme.muted(for: colorScheme)))
                                            )
                                            .frame(width: 3.5, height: 3.5)
                                    }
                                }
                            } else {
                                Circle()
                                    .fill(Color.clear)
                                    .frame(width: 3.5, height: 3.5)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 7)
                        .background(
                            isSelected
                                ? GazetteTheme.accent(for: colorScheme)
                                : (isToday ? GazetteTheme.accentDim(for: colorScheme) : GazetteTheme.surface(for: colorScheme))
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .stroke(
                                    isToday && !isSelected
                                        ? GazetteTheme.accent(for: colorScheme).opacity(0.5)
                                        : GazetteTheme.border(for: colorScheme).opacity(0.7),
                                    lineWidth: 1
                                )
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(10)
        .background(GazetteTheme.surface(for: colorScheme))
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .stroke(GazetteTheme.border(for: colorScheme), lineWidth: 1)
        )
    }

    private var currentMonthFormatted: String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.dateFormat = "MMMM yyyy"
        return formatter.string(from: store.selectedDate).capitalized
    }

    private var currentWeekOfYear: Int {
        Calendar.current.component(.weekOfYear, from: store.selectedDate)
    }

    private func navigateWeek(by offset: Int) {
        if let next = Calendar.current.date(byAdding: .weekOfYear, value: offset, to: store.selectedDate) {
            withAnimation(.snappy(duration: 0.2)) {
                store.selectedDate = next
            }
            let impact = UIImpactFeedbackGenerator(style: .light)
            impact.impactOccurred()
        }
    }

    private struct DayItem {
        let date: Date
        let initial: String
        let dayNumber: String
        let eventCount: Int
        let hasExam: Bool
    }

    private var weekDays: [DayItem] {
        var cal = Calendar.current
        cal.firstWeekday = 2 // Lundi
        let date = store.selectedDate

        guard let weekInterval = cal.dateInterval(of: .weekOfYear, for: date) else {
            return []
        }

        var days: [DayItem] = []
        let initials = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]

        for i in 0..<6 {
            if let d = cal.date(byAdding: .day, value: i, to: weekInterval.start) {
                let dayNum = String(cal.component(.day, from: d))
                let dayCourses = store.events.filter { cal.isDate($0.dtstart, inSameDayAs: d) }
                let hasExam = dayCourses.contains { $0.category == .exam }
                days.append(
                    DayItem(
                        date: d,
                        initial: initials[i],
                        dayNumber: dayNum,
                        eventCount: dayCourses.count,
                        hasExam: hasExam
                    )
                )
            }
        }
        return days
    }
}
