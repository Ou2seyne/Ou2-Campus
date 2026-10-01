import Foundation

public struct HomeworkItem: Identifiable, Codable, Hashable, Sendable {
    public let id: UUID
    public var courseTitle: String
    public var text: String
    public var dueDate: Date?
    public var isDone: Bool
    public let createdAt: Date

    public init(
        id: UUID = UUID(),
        courseTitle: String,
        text: String,
        dueDate: Date? = nil,
        isDone: Bool = false,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.courseTitle = courseTitle
        self.text = text
        self.dueDate = dueDate
        self.isDone = isDone
        self.createdAt = createdAt
    }

    public static let sampleItems: [HomeworkItem] = [
        HomeworkItem(
            courseTitle: "Algorithmique et programmation 1",
            text: "Préparer le TP 3 sur les pointeurs et tableaux dynamiques (Salle D004)",
            dueDate: Calendar.current.date(byAdding: .day, value: 3, to: Date()),
            isDone: false
        ),
        HomeworkItem(
            courseTitle: "Calculus 1",
            text: "Faire les exercices 4 et 7 de la feuille de TD 2 (M. Baranek)",
            dueDate: Calendar.current.date(byAdding: .day, value: 1, to: Date()),
            isDone: false
        )
    ]
}
