import SwiftUI

public struct UrlInputSheet: View {
    @Bindable var store = ScheduleStore.shared
    @Environment(\.dismiss) var dismiss

    @State private var customName: String = ""
    @State private var customUrl: String = ""

    public var body: some View {
        NavigationStack {
            List {
                Section("Plannings enregistrés") {
                    ForEach(store.savedSchedules) { s in
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(s.name)
                                    .font(.system(.body, design: .rounded, weight: .semibold))
                                Text(s.url)
                                    .font(.system(size: 11, design: .monospaced))
                                    .foregroundStyle(.secondary)
                                    .lineLimit(1)
                            }

                            Spacer()

                            if s.id == store.currentScheduleId {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundStyle(Color.accentColor)
                            }
                        }
                        .contentShape(Rectangle())
                        .onTapGesture {
                            store.switchSchedule(to: s.id)
                            dismiss()
                        }
                    }
                    .onDelete { indexSet in
                        for idx in indexSet {
                            let s = store.savedSchedules[idx]
                            store.deleteSchedule(id: s.id)
                        }
                    }
                }

                Section("Ajouter un emploi du temps ADE") {
                    TextField("Nom (ex: L1 Maths TD2)", text: $customName)
                    TextField("URL ADE (.ics ou .shu)", text: $customUrl)
                        .keyboardType(.URL)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()

                    Button {
                        if !customUrl.isEmpty {
                            let name = customName.isEmpty ? "Mon Emploi du Temps" : customName
                            store.addSchedule(name: name, url: customUrl)
                            dismiss()
                        }
                    } label: {
                        HStack {
                            Image(systemName: "plus.circle.fill")
                            Text("Enregistrer et synchroniser")
                        }
                        .font(.system(.body, weight: .bold))
                    }
                    .disabled(customUrl.trimmingCharacters(in: .whitespaces).isEmpty)
                }

                Section("Aide & Synchronisation ADE") {
                    Text("Pour obtenir votre lien ADE : connectez-vous sur l'ADE de votre université, cliquez sur l'icône de calendrier ou d'exportation d'agenda, puis copiez l'URL de flux iCalendar (se terminant par .ics ou .shu).")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Gérer les plannings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Fermer") { dismiss() }
                        .font(.system(.body, weight: .semibold))
                }
            }
        }
    }
}
