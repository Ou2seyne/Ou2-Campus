import SwiftUI

public struct CourseDetailSheet: View {
    let event: ScheduleEvent
    @Bindable var store = ScheduleStore.shared
    @Environment(\.dismiss) var dismiss
    @Environment(\.colorScheme) var colorScheme

    @State private var newHomeworkText: String = ""
    @State private var showingAddHomework: Bool = false
    @State private var copiedRoom: Bool = false

    private var campusInfo: CampusLocationInfo? {
        LensCampusGuide.location(for: event.room)
    }

    private var linkedHomeworks: [HomeworkItem] {
        store.homeworkItems.filter {
            $0.courseTitle.lowercased() == event.cleanTitle.lowercased()
        }
    }

    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    // Header héro avec icône arrondie et catégorie
                    HStack(spacing: 12) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .fill(event.category.bgColor(for: colorScheme))
                                .frame(width: 46, height: 46)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                                        .stroke(event.category.barColor(for: colorScheme), lineWidth: 1.5)
                                )

                            Image(systemName: event.category.systemImage)
                                .font(.system(size: 20, weight: .bold))
                                .foregroundStyle(event.category.barColor(for: colorScheme))
                        }

                        VStack(alignment: .leading, spacing: 3) {
                            Text(event.category.title.uppercased())
                                .font(.system(size: 10, weight: .heavy, design: .monospaced))
                                .foregroundStyle(event.category.barColor(for: colorScheme))

                            Text("\(event.startTimeFormatted) – \(event.endTimeFormatted)")
                                .font(.system(size: 16, weight: .heavy, design: .monospaced))
                                .foregroundStyle(GazetteTheme.text(for: colorScheme))

                            Text("Durée : \(ScheduleStore.formatDuration(minutes: event.durationMinutes))")
                                .font(.system(size: 11, weight: .medium, design: .monospaced))
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

                    // Titre du cours
                    Text(event.cleanTitle)
                        .font(.system(size: 18, weight: .bold, design: .default))
                        .foregroundStyle(GazetteTheme.text(for: colorScheme))

                    // Carte Campus de Lens & Salle
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(spacing: 6) {
                            Image(systemName: "mappin.circle.fill")
                                .font(.system(size: 12))
                                .foregroundStyle(event.category.barColor(for: colorScheme))
                            Text("LOCALISATION · CAMPUS DE LENS")
                                .font(.system(size: 10, weight: .heavy, design: .monospaced))
                                .foregroundStyle(GazetteTheme.muted(for: colorScheme))

                            Spacer()

                            Button {
                                let room = event.room.isEmpty ? event.location : event.room
                                UIPasteboard.general.string = room
                                withAnimation(.snappy(duration: 0.2)) {
                                    copiedRoom = true
                                }
                                let impact = UINotificationFeedbackGenerator()
                                impact.notificationOccurred(.success)
                                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                    copiedRoom = false
                                }
                            } label: {
                                HStack(spacing: 3) {
                                    Image(systemName: copiedRoom ? "checkmark" : "doc.on.doc")
                                        .font(.system(size: 9, weight: .bold))
                                    Text(copiedRoom ? "Copié !" : "Copier")
                                        .font(.system(size: 10, weight: .bold))
                                }
                                .padding(.horizontal, 7)
                                .padding(.vertical, 3)
                                .background(GazetteTheme.surface2(for: colorScheme))
                                .foregroundStyle(GazetteTheme.text(for: colorScheme))
                                .clipShape(Capsule())
                            }
                            .buttonStyle(.plain)
                        }

                        VStack(alignment: .leading, spacing: 3) {
                            Text(event.room.isEmpty ? "Salle non précisée" : event.room)
                                .font(.system(size: 17, weight: .heavy, design: .monospaced))
                                .foregroundStyle(GazetteTheme.text(for: colorScheme))

                            if let info = campusInfo {
                                Text("\(info.building) · \(info.floor)")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundStyle(GazetteTheme.muted(for: colorScheme))

                                if let note = info.note {
                                    Text(note)
                                        .font(.system(size: 11))
                                        .foregroundStyle(GazetteTheme.muted2(for: colorScheme))
                                        .padding(.top, 2)
                                }
                            }
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

                    // Cartes Enseignant & Sous-groupe
                    HStack(spacing: 8) {
                        VStack(alignment: .leading, spacing: 3) {
                            Text("ENSEIGNANT")
                                .font(.system(size: 9, weight: .heavy, design: .monospaced))
                                .foregroundStyle(GazetteTheme.muted(for: colorScheme))

                            Text(event.teacher.isEmpty ? "Non renseigné" : event.teacher)
                                .font(.system(size: 13, weight: .bold))
                                .foregroundStyle(GazetteTheme.text(for: colorScheme))
                                .lineLimit(1)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(10)
                        .background(GazetteTheme.surface(for: colorScheme))
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .stroke(GazetteTheme.border(for: colorScheme), lineWidth: 1)
                        )

                        VStack(alignment: .leading, spacing: 3) {
                            Text("SOUS-GROUPE")
                                .font(.system(size: 9, weight: .heavy, design: .monospaced))
                                .foregroundStyle(GazetteTheme.muted(for: colorScheme))

                            Text(event.subGroup ?? "Tous")
                                .font(.system(size: 13, weight: .bold, design: .monospaced))
                                .foregroundStyle(GazetteTheme.text(for: colorScheme))
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(10)
                        .background(GazetteTheme.surface(for: colorScheme))
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .stroke(GazetteTheme.border(for: colorScheme), lineWidth: 1)
                        )
                    }

                    // Bouton Export Calendrier Apple
                    Button {
                        let impact = UIImpactFeedbackGenerator(style: .medium)
                        impact.impactOccurred()
                        CalendarExporter.shareEvent(event)
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: "calendar.badge.plus")
                                .font(.system(size: 14, weight: .bold))
                            Text("Exporter vers Calendrier Apple (.ics)")
                                .font(.system(size: 13, weight: .heavy, design: .monospaced))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(GazetteTheme.accent(for: colorScheme))
                        .foregroundStyle(Color.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    }
                    .buttonStyle(.plain)

                    // Section Devoirs liés
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            HStack(spacing: 6) {
                                Image(systemName: "book.fill")
                                    .font(.system(size: 10))
                                    .foregroundStyle(Color(hex: "#7C3AED"))
                                Text("DEVOIRS POUR CE COURS")
                                    .font(.system(size: 10, weight: .heavy, design: .monospaced))
                                    .foregroundStyle(GazetteTheme.muted(for: colorScheme))
                            }
                            Spacer()
                            Button {
                                showingAddHomework.toggle()
                            } label: {
                                HStack(spacing: 3) {
                                    Image(systemName: showingAddHomework ? "xmark" : "plus")
                                        .font(.system(size: 9, weight: .heavy))
                                    Text(showingAddHomework ? "Fermer" : "Ajouter")
                                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                                }
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(GazetteTheme.surface2(for: colorScheme))
                                .foregroundStyle(GazetteTheme.text(for: colorScheme))
                                .clipShape(Capsule())
                            }
                            .buttonStyle(.plain)
                        }

                        if showingAddHomework {
                            HStack(spacing: 6) {
                                TextField("Titre du devoir ou rappel...", text: $newHomeworkText)
                                    .font(.system(size: 12))
                                    .padding(8)
                                    .background(GazetteTheme.surface2(for: colorScheme))
                                    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

                                Button("Enregistrer") {
                                    if !newHomeworkText.isEmpty {
                                        store.addHomework(courseTitle: event.cleanTitle, text: newHomeworkText)
                                        newHomeworkText = ""
                                        showingAddHomework = false
                                    }
                                }
                                .font(.system(size: 11, weight: .bold, design: .monospaced))
                                .padding(.horizontal, 10)
                                .padding(.vertical, 8)
                                .background(GazetteTheme.accent(for: colorScheme))
                                .foregroundStyle(Color.white)
                                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                            }
                        }

                        if linkedHomeworks.isEmpty {
                            Text("Aucun devoir enregistré pour cette matière.")
                                .font(.system(size: 11))
                                .foregroundStyle(GazetteTheme.muted(for: colorScheme))
                                .padding(.vertical, 2)
                        } else {
                            VStack(spacing: 6) {
                                ForEach(linkedHomeworks) { hw in
                                    HStack(spacing: 8) {
                                        Button {
                                            store.toggleHomework(hw)
                                        } label: {
                                            Image(systemName: hw.isDone ? "checkmark.square.fill" : "square")
                                                .font(.system(size: 15))
                                                .foregroundStyle(hw.isDone ? Color.green : GazetteTheme.muted(for: colorScheme))
                                        }
                                        .buttonStyle(.plain)

                                        Text(hw.text)
                                            .font(.system(size: 13, weight: .medium))
                                            .strikethrough(hw.isDone)
                                            .foregroundStyle(hw.isDone ? GazetteTheme.muted(for: colorScheme) : GazetteTheme.text(for: colorScheme))

                                        Spacer()
                                    }
                                    .padding(10)
                                    .background(GazetteTheme.surface2(for: colorScheme))
                                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                                }
                            }
                        }
                    }
                    .padding(12)
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
            .navigationTitle("Fiche de cours")
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
