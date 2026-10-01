import SwiftUI

public struct HeaderView: View {
    @Bindable var store = ScheduleStore.shared

    let onOpenExamRadar: () -> Void
    let onOpenHomework: () -> Void
    let onOpenAnalytics: () -> Void
    let onOpenUrlModal: () -> Void

    @Environment(\.colorScheme) var colorScheme

    public var body: some View {
        HStack(alignment: .center, spacing: 8) {
            // Titre & Sous-titre épuré
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(store.currentSchedule?.name ?? "Emploi du temps")
                        .font(.system(size: 18, weight: .bold, design: .default))
                        .foregroundStyle(GazetteTheme.text(for: colorScheme))
                        .lineLimit(1)

                    if store.isOffline {
                        Circle()
                            .fill(Color.orange)
                            .frame(width: 6, height: 6)
                    }
                }

                Text(currentDateLabel)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(GazetteTheme.muted(for: colorScheme))
            }

            Spacer(minLength: 4)

            // Boutons d'action minimalistes & Sélecteur Clair/Sombre
            HStack(spacing: 6) {
                // Bouton retour à "Aujourd'hui" si une autre date est sélectionnée
                if !Calendar.current.isDateInToday(store.selectedDate) {
                    Button {
                        withAnimation(.snappy(duration: 0.2)) {
                            store.selectedDate = Date()
                        }
                        let impact = UIImpactFeedbackGenerator(style: .light)
                        impact.impactOccurred()
                    } label: {
                        Text("Aujourd'hui")
                            .font(.system(size: 11, weight: .bold))
                            .padding(.horizontal, 9)
                            .padding(.vertical, 5)
                            .background(GazetteTheme.accentDim(for: colorScheme))
                            .foregroundStyle(GazetteTheme.accent(for: colorScheme))
                            .clipShape(Capsule())
                    }
                    .buttonStyle(.plain)
                    .transition(.scale.combined(with: .opacity))
                }

                // SÉLECTEUR DE THÈME VISUEL (Clair / Sombre / Auto)
                HStack(spacing: 2) {
                    ForEach(ScheduleStore.ThemeMode.allCases) { mode in
                        let isSelected = store.themeMode == mode
                        Button {
                            store.setTheme(mode)
                        } label: {
                            ZStack {
                                if isSelected {
                                    Capsule()
                                        .fill(GazetteTheme.surface(for: colorScheme))
                                        .shadow(color: Color.black.opacity(colorScheme == .dark ? 0.35 : 0.08), radius: 2, y: 1)
                                }

                                Image(systemName: mode.icon)
                                    .font(.system(size: 11, weight: isSelected ? .black : .semibold))
                                    .foregroundStyle(
                                        isSelected
                                            ? (mode == .light ? Color.orange : (mode == .dark ? Color(hex: "#818CF8") : GazetteTheme.accent(for: colorScheme)))
                                            : GazetteTheme.muted(for: colorScheme)
                                    )
                            }
                            .frame(width: 26, height: 26)
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel("Activer le mode \(mode.title)")
                    }
                }
                .padding(2)
                .background(GazetteTheme.surface2(for: colorScheme))
                .clipShape(Capsule())
                .overlay(
                    Capsule()
                        .stroke(GazetteTheme.border(for: colorScheme), lineWidth: 1)
                )

                // Menu d'actions minimaliste (style Pronote / Papillon)
                Menu {
                    Section("Thème de l'application") {
                        Button {
                            store.setTheme(.light)
                        } label: {
                            Label("Mode Clair (Lumineux)", systemImage: store.themeMode == .light ? "checkmark" : "sun.max.fill")
                        }

                        Button {
                            store.setTheme(.dark)
                        } label: {
                            Label("Mode Sombre (OLED)", systemImage: store.themeMode == .dark ? "checkmark" : "moon.fill")
                        }

                        Button {
                            store.setTheme(.system)
                        } label: {
                            Label("Automatique (Système)", systemImage: store.themeMode == .system ? "checkmark" : "circle.lefthalf.filled")
                        }
                    }

                    Section("Affichage") {
                        Button {
                            store.viewMode = .day
                        } label: {
                            Label("Vue Jour (Timeline)", systemImage: store.viewMode == .day ? "checkmark" : "calendar.day.timeline.left")
                        }

                        Button {
                            store.viewMode = .week
                        } label: {
                            Label("Vue Semaine (Grille)", systemImage: store.viewMode == .week ? "checkmark" : "calendar")
                        }
                    }

                    if !store.availableSubGroups.isEmpty {
                        Section("Sous-groupe TD/TP") {
                            Button {
                                store.selectedSubGroup = "ALL"
                            } label: {
                                Label("Tous les groupes", systemImage: store.selectedSubGroup == "ALL" ? "checkmark" : "person.3")
                            }

                            ForEach(store.availableSubGroups, id: \.self) { sg in
                                Button {
                                    store.selectedSubGroup = sg
                                } label: {
                                    Label("Groupe \(sg)", systemImage: store.selectedSubGroup == sg ? "checkmark" : "person.2")
                                }
                            }
                        }
                    }

                    Section("Outils") {
                        Button {
                            onOpenExamRadar()
                        } label: {
                            Label("Radar Examens & DS", systemImage: "exclamationmark.triangle")
                        }

                        Button {
                            onOpenHomework()
                        } label: {
                            Label("Devoirs & Rappels", systemImage: "book")
                        }

                        Button {
                            onOpenAnalytics()
                        } label: {
                            Label("Statistiques de cours", systemImage: "chart.bar")
                        }
                    }

                    Section("Configuration") {
                        Button {
                            onOpenUrlModal()
                        } label: {
                            Label("Gérer les plannings ADE", systemImage: "slider.horizontal.3")
                        }

                        Button {
                            Task {
                                await store.fetchSchedule()
                            }
                        } label: {
                            Label("Actualiser maintenant", systemImage: "arrow.clockwise")
                        }
                    }
                } label: {
                    ZStack(alignment: .topTrailing) {
                        Image(systemName: "ellipsis")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundStyle(GazetteTheme.text(for: colorScheme))
                            .frame(width: 32, height: 32)
                            .background(GazetteTheme.surface2(for: colorScheme))
                            .clipShape(Circle())
                            .overlay(
                                Circle()
                                    .stroke(GazetteTheme.border(for: colorScheme), lineWidth: 1)
                            )

                        // Badge si devoirs ou examens à venir
                        let pendingHomework = store.homeworkItems.filter { !$0.isDone }.count
                        if store.examCount > 0 || pendingHomework > 0 {
                            Circle()
                                .fill(store.examCount > 0 ? Color.red : GazetteTheme.accent(for: colorScheme))
                                .frame(width: 8, height: 8)
                                .offset(x: 1, y: 1)
                        }
                    }
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
        .background(GazetteTheme.surface(for: colorScheme))
    }

    private var currentDateLabel: String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.dateFormat = "EEEE d MMMM"
        return formatter.string(from: store.selectedDate).capitalized
    }
}
