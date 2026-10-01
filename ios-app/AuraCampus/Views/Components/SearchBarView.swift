import SwiftUI

public struct SearchBarView: View {
    @Bindable var store = ScheduleStore.shared
    @Environment(\.colorScheme) var colorScheme

    public var body: some View {
        VStack(spacing: 8) {
            // Ligne 1 : Champ de recherche avec champ arrondi & compteur
            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(GazetteTheme.muted2(for: colorScheme))

                TextField("Rechercher un cours, enseignant, salle…", text: $store.searchQuery)
                    .font(.system(size: 13, weight: .medium, design: .default))
                    .foregroundStyle(GazetteTheme.text(for: colorScheme))
                    .autocorrectionDisabled()

                if !store.searchQuery.isEmpty {
                    Button {
                        store.searchQuery = ""
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 13))
                            .foregroundStyle(GazetteTheme.muted(for: colorScheme))
                    }
                    .buttonStyle(.plain)
                }

                // Compteur de résultats
                Text("\(store.filteredEvents.count)")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(GazetteTheme.surface2(for: colorScheme))
                    .foregroundStyle(GazetteTheme.muted(for: colorScheme))
                    .clipShape(Capsule())
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 8)
            .background(GazetteTheme.surface(for: colorScheme))
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(GazetteTheme.border(for: colorScheme), lineWidth: 1)
            )

            // Ligne 2 : Filtres de catégorie & Sous-groupe en capsules scrollables
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 6) {
                    // Sélecteur de sous-groupe rapide si disponible
                    if !store.availableSubGroups.isEmpty {
                        Menu {
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
                        } label: {
                            HStack(spacing: 4) {
                                Image(systemName: "person.2.fill")
                                    .font(.system(size: 9))
                                Text(store.selectedSubGroup == "ALL" ? "Tous les groupes" : "Grp: \(store.selectedSubGroup)")
                                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                                Image(systemName: "chevron.down")
                                    .font(.system(size: 8, weight: .bold))
                            }
                            .padding(.horizontal, 9)
                            .padding(.vertical, 5)
                            .background(GazetteTheme.surface(for: colorScheme))
                            .foregroundStyle(GazetteTheme.accent(for: colorScheme))
                            .clipShape(Capsule())
                            .overlay(
                                Capsule()
                                    .stroke(GazetteTheme.accent(for: colorScheme).opacity(0.4), lineWidth: 1)
                            )
                        }
                    }

                    // Filtre Tous
                    categoryFilterChip(title: "Tous", category: nil)

                    // Filtres de catégories
                    categoryFilterChip(title: "CM", category: .cm)
                    categoryFilterChip(title: "TD", category: .td)
                    categoryFilterChip(title: "TP", category: .tp)
                    categoryFilterChip(title: "Examens", category: .exam)
                    categoryFilterChip(title: "Projets", category: .projet)
                }
                .padding(.horizontal, 2)
            }
        }
    }

    @ViewBuilder
    private func categoryFilterChip(title: String, category: CourseCategory?) -> some View {
        let isSelected = store.selectedCategory == category
        let color = category?.barColor(for: colorScheme) ?? GazetteTheme.text(for: colorScheme)

        Button {
            withAnimation(.snappy(duration: 0.15)) {
                if store.selectedCategory == category {
                    store.selectedCategory = nil
                } else {
                    store.selectedCategory = category
                }
            }
            let impact = UIImpactFeedbackGenerator(style: .light)
            impact.impactOccurred()
        } label: {
            HStack(spacing: 4) {
                if let cat = category {
                    Circle()
                        .fill(isSelected ? Color.white : cat.barColor(for: colorScheme))
                        .frame(width: 6, height: 6)
                }

                Text(title)
                    .font(.system(size: 11, weight: isSelected ? .heavy : .semibold, design: .monospaced))
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(
                isSelected
                    ? color
                    : GazetteTheme.surface(for: colorScheme)
            )
            .foregroundStyle(
                isSelected
                    ? Color.white
                    : GazetteTheme.muted(for: colorScheme)
            )
            .clipShape(Capsule())
            .overlay(
                Capsule()
                    .stroke(
                        isSelected
                            ? color
                            : GazetteTheme.border(for: colorScheme).opacity(0.8),
                        lineWidth: 1
                    )
            )
        }
        .buttonStyle(.plain)
    }
}
