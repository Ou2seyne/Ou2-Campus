import SwiftUI

public struct HomeworkSheet: View {
    @Bindable var store = ScheduleStore.shared
    @Environment(\.dismiss) var dismiss

    @State private var showingAddModal: Bool = false
    @State private var newTitle: String = ""
    @State private var selectedCourse: String = ""
    @State private var hasDueDate: Bool = false
    @State private var dueDate: Date = Date().addingTimeInterval(86400 * 2)

    private var availableCourses: [String] {
        var set = Set<String>()
        for event in store.events {
            set.insert(event.cleanTitle)
        }
        return Array(set).sorted()
    }

    public var body: some View {
        NavigationStack {
            List {
                Section {
                    Button {
                        showingAddModal = true
                    } label: {
                        HStack(spacing: 8) {
                            Image(systemName: "plus.circle.fill")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundStyle(Color.purple)
                            Text("Ajouter un devoir ou un rappel")
                                .font(.system(.body, design: .rounded, weight: .semibold))
                                .foregroundStyle(Color.purple)
                        }
                        .padding(.vertical, 4)
                    }
                }

                Section("À faire (\(pendingItems.count))") {
                    if pendingItems.isEmpty {
                        Text("Aucun devoir en attente. Tout est à jour !")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .padding(.vertical, 8)
                    } else {
                        ForEach(pendingItems) { item in
                            HomeworkRow(item: item) {
                                store.toggleHomework(item)
                            }
                        }
                        .onDelete(perform: deletePending)
                    }
                }

                if !completedItems.isEmpty {
                    Section("Terminés (\(completedItems.count))") {
                        ForEach(completedItems) { item in
                            HomeworkRow(item: item) {
                                store.toggleHomework(item)
                            }
                        }
                        .onDelete(perform: deleteCompleted)
                    }
                }
            }
            .navigationTitle("Devoirs & Rappels")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Fermer") { dismiss() }
                        .font(.system(.body, weight: .semibold))
                }
            }
            .sheet(isPresented: $showingAddModal) {
                NavigationStack {
                    Form {
                        Section("Description du travail") {
                            TextField("Ex: Préparer le TP 3 sur les pointeurs...", text: $newTitle)
                        }

                        Section("Matière associée") {
                            Picker("Cours", selection: $selectedCourse) {
                                Text("Général (sans cours précis)").tag("")
                                ForEach(availableCourses, id: \.self) { c in
                                    Text(c).tag(c)
                                }
                            }
                        }

                        Section("Échéance") {
                            Toggle("Date limite", isOn: $hasDueDate)
                            if hasDueDate {
                                DatePicker("Date", selection: $dueDate, displayedComponents: [.date])
                            }
                        }
                    }
                    .navigationTitle("Nouveau devoir")
                    .navigationBarTitleDisplayMode(.inline)
                    .toolbar {
                        ToolbarItem(placement: .cancellationAction) {
                            Button("Annuler") { showingAddModal = false }
                        }
                        ToolbarItem(placement: .confirmationAction) {
                            Button("Enregistrer") {
                                if !newTitle.isEmpty {
                                    store.addHomework(
                                        courseTitle: selectedCourse.isEmpty ? "Général" : selectedCourse,
                                        text: newTitle,
                                        dueDate: hasDueDate ? dueDate : nil
                                    )
                                    newTitle = ""
                                    showingAddModal = false
                                }
                            }
                            .disabled(newTitle.trimmingCharacters(in: .whitespaces).isEmpty)
                        }
                    }
                }
                .presentationDetents([.medium])
            }
        }
    }

    private var pendingItems: [HomeworkItem] {
        store.homeworkItems.filter { !$0.isDone }
    }

    private var completedItems: [HomeworkItem] {
        store.homeworkItems.filter { $0.isDone }
    }

    private func deletePending(at offsets: IndexSet) {
        for idx in offsets {
            let item = pendingItems[idx]
            store.deleteHomework(item)
        }
    }

    private func deleteCompleted(at offsets: IndexSet) {
        for idx in offsets {
            let item = completedItems[idx]
            store.deleteHomework(item)
        }
    }
}

struct HomeworkRow: View {
    let item: HomeworkItem
    let onToggle: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            Button(action: onToggle) {
                Image(systemName: item.isDone ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 20))
                    .foregroundStyle(item.isDone ? Color.emerald : .secondary)
            }
            .buttonStyle(.plain)
            .tactileHaptic()

            VStack(alignment: .leading, spacing: 3) {
                Text(item.text)
                    .font(.system(.body, design: .rounded))
                    .strikethrough(item.isDone)
                    .foregroundStyle(item.isDone ? .secondary : .primary)

                HStack(spacing: 6) {
                    Text(item.courseTitle)
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                        .foregroundStyle(Color.purple)

                    if let due = item.dueDate {
                        Text("· Échéance : \(dateFormatted(due))")
                            .font(.system(size: 11))
                            .foregroundStyle(.secondary)
                    }
                }
            }
        }
        .padding(.vertical, 4)
    }

    private func dateFormatted(_ date: Date) -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "fr_FR")
        f.dateFormat = "d MMM"
        return f.string(from: date)
    }
}
