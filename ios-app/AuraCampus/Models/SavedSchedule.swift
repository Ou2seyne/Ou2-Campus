import Foundation

public struct SavedSchedule: Identifiable, Codable, Hashable, Sendable {
    public let id: String
    public var name: String
    public var url: String
    public var isFavorite: Bool
    public var lastAccessedAt: Date

    public init(
        id: String = UUID().uuidString,
        name: String,
        url: String,
        isFavorite: Bool = false,
        lastAccessedAt: Date = Date()
    ) {
        self.id = id
        self.name = name
        self.url = url
        self.isFavorite = isFavorite
        self.lastAccessedAt = lastAccessedAt
    }

    public static let defaultPresets: [SavedSchedule] = [
        SavedSchedule(
            id: "real-l1-math-artois",
            name: "L1 MATHS TD2 (Univ Artois)",
            url: "https://ade-consult.univ-artois.fr/jsp/custom/modules/plannings/5YGpM4nJ.shu",
            isFavorite: true
        ),
        SavedSchedule(
            id: "preset-l3-info",
            name: "Licence 3 Informatique",
            url: "demo://sample-l3",
            isFavorite: false
        ),
        SavedSchedule(
            id: "preset-m1-miage",
            name: "Master MIAGE - Web & Cloud",
            url: "demo://sample-miage",
            isFavorite: false
        ),
        SavedSchedule(
            id: "preset-but-info",
            name: "BUT Informatique (S4)",
            url: "demo://sample-but",
            isFavorite: false
        )
    ]
}
