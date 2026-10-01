import SwiftUI

public struct WeekView: View {
    @Bindable var store = ScheduleStore.shared
    let onSelectEvent: (ScheduleEvent) -> Void

    @Environment(\.colorScheme) var colorScheme
    private let calendar = Calendar.current

    public var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(alignment: .top, spacing: 10) {
                ForEach(daysOfWeek, id: \.self) { date in
                    let dayEvents = store.filteredEvents
                        .filter { calendar.isDate($0.dtstart, inSameDayAs: date) }
                        .sorted { $0.dtstart < $1.dtstart }
                    let isToday = calendar.isDateInToday(date)
                    let isSelected = calendar.isDate(date, inSameDayAs: store.selectedDate)

                    VStack(alignment: .leading, spacing: 0) {
                        // En-tête de colonne de jour
                        Button {
                            withAnimation(.snappy(duration: 0.2)) {
                                store.selectedDate = date
                                store.viewMode = .day
                            }
                            let impact = UIImpactFeedbackGenerator(style: .light)
                            impact.impactOccurred()
                        } label: {
                            HStack(alignment: .firstTextBaseline) {
                                VStack(alignment: .leading, spacing: 1) {
                                    Text(shortDayName(for: date))
                                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                                        .foregroundStyle(isToday ? GazetteTheme.accent(for: colorScheme) : GazetteTheme.muted(for: colorScheme))

                                    Text(dayNumber(for: date))
                                        .font(.system(size: 18, weight: .heavy, design: .rounded))
                                        .foregroundStyle(isToday ? GazetteTheme.accent(for: colorScheme) : GazetteTheme.text(for: colorScheme))
                                }

                                Spacer()

                                VStack(alignment: .trailing, spacing: 2) {
                                    if isToday {
                                        Text("AUJ.")
                                            .font(.system(size: 9, weight: .heavy, design: .monospaced))
                                            .padding(.horizontal, 5)
                                            .padding(.vertical, 2)
                                            .background(GazetteTheme.accent(for: colorScheme))
                                            .foregroundStyle(.white)
                                            .clipShape(Capsule())
                                    } else {
                                        Text(dayEvents.isEmpty ? "—" : "\(dayEvents.count) cours")
                                            .font(.system(size: 10, weight: .bold, design: .monospaced))
                                            .foregroundStyle(GazetteTheme.muted(for: colorScheme))
                                    }
                                }
                            }
                            .padding(.horizontal, 10)
                            .padding(.vertical, 8)
                            .frame(maxWidth: .infinity)
                            .background(
                                isSelected
                                    ? GazetteTheme.accentDim(for: colorScheme)
                                    : (isToday ? GazetteTheme.surface2(for: colorScheme) : GazetteTheme.surface(for: colorScheme))
                            )
                        }
                        .buttonStyle(.plain)

                        Rectangle()
                            .fill(GazetteTheme.border(for: colorScheme))
                            .frame(height: 1)

                        // Liste des cours de la colonne
                        if dayEvents.isEmpty {
                            VStack(spacing: 6) {
                                Image(systemName: "cup.and.saucer.fill")
                                    .font(.system(size: 14))
                                    .foregroundStyle(GazetteTheme.border2(for: colorScheme))
                                Text("Journée libre")
                                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                                    .foregroundStyle(GazetteTheme.muted2(for: colorScheme))
                            }
                            .frame(maxWidth: .infinity, minHeight: 180)
                            .background(GazetteTheme.surface(for: colorScheme))
                        } else {
                            VStack(spacing: 6) {
                                ForEach(dayEvents) { event in
                                    Button {
                                        let impact = UIImpactFeedbackGenerator(style: .light)
                                        impact.impactOccurred()
                                        onSelectEvent(event)
                                    } label: {
                                        HStack(spacing: 0) {
                                            // Barre latérale de catégorie
                                            Rectangle()
                                                .fill(event.category.barColor(for: colorScheme))
                                                .frame(width: 3.5)

                                            VStack(alignment: .leading, spacing: 4) {
                                                HStack {
                                                    Text("\(event.startTimeFormatted) – \(event.endTimeFormatted)")
                                                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                                                        .foregroundStyle(GazetteTheme.muted(for: colorScheme))

                                                    Spacer()

                                                    Text(event.category.shortLabel)
                                                        .font(.system(size: 8, weight: .heavy, design: .monospaced))
                                                        .padding(.horizontal, 4)
                                                        .padding(.vertical, 1)
                                                        .background(event.category.barColor(for: colorScheme))
                                                        .foregroundStyle(.white)
                                                        .clipShape(RoundedRectangle(cornerRadius: 4, style: .continuous))
                                                }

                                                Text(event.cleanTitle)
                                                    .font(.system(size: 11, weight: .bold, design: .default))
                                                    .foregroundStyle(GazetteTheme.text(for: colorScheme))
                                                    .lineLimit(2)
                                                    .multilineTextAlignment(.leading)

                                                if !event.room.isEmpty {
                                                    HStack(spacing: 3) {
                                                        Image(systemName: "mappin.fill")
                                                            .font(.system(size: 7))
                                                        Text(event.room)
                                                            .font(.system(size: 9, weight: .bold, design: .monospaced))
                                                    }
                                                    .foregroundStyle(GazetteTheme.accent(for: colorScheme))
                                                }
                                            }
                                            .padding(6)
                                        }
                                        .background(event.category.bgColor(for: colorScheme))
                                        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 8, style: .continuous)
                                                .stroke(GazetteTheme.border(for: colorScheme).opacity(0.8), lineWidth: 1)
                                        )
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                            .padding(6)
                            .background(GazetteTheme.surface(for: colorScheme))
                        }
                    }
                    .frame(width: 170)
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(
                                isSelected
                                    ? GazetteTheme.accent(for: colorScheme)
                                    : GazetteTheme.border(for: colorScheme),
                                lineWidth: isSelected ? 1.5 : 1
                            )
                    )
                }
            }
            .padding(.horizontal, 2)
            .padding(.vertical, 4)
        }
    }

    private var daysOfWeek: [Date] {
        var cal = Calendar.current
        cal.firstWeekday = 2
        guard let weekInterval = cal.dateInterval(of: .weekOfYear, for: store.selectedDate) else {
            return []
        }
        return (0..<6).compactMap { cal.date(byAdding: .day, value: $0, to: weekInterval.start) }
    }

    private func shortDayName(for date: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.dateFormat = "EEE"
        return formatter.string(from: date).capitalized
    }

    private func dayNumber(for date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d"
        return formatter.string(from: date)
    }
}
