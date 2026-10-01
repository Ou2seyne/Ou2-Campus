import Foundation

public struct CampusLocationInfo: Sendable {
    public let building: String
    public let floor: String
    public let badge: String
    public let note: String?

    public init(building: String, floor: String, badge: String, note: String? = nil) {
        self.building = building
        self.floor = floor
        self.badge = badge
        self.note = note
    }
}

public enum LensCampusGuide {
    public static func location(for rawRoom: String) -> CampusLocationInfo? {
        let text = rawRoom.trimmingCharacters(in: .whitespacesAndNewlines)
        if text.isEmpty { return nil }

        let lower = text.lowercased()
        if lower.contains("barbeaux") {
            return CampusLocationInfo(
                building: "Bâtiment Sciences",
                floor: "Rez-de-chaussée",
                badge: "Grand Amphi Barbeaux",
                note: "Entrée principale de la Faculté des Sciences de Lens"
            )
        }
        if lower.contains("souriau") {
            return CampusLocationInfo(
                building: "Bâtiment Sciences",
                floor: "Rez-de-chaussée",
                badge: "Amphi Souriau",
                note: "Aile amphithéâtres, Faculté des Sciences"
            )
        }
        if lower.contains("amphi") {
            return CampusLocationInfo(
                building: "Bâtiment Sciences",
                floor: "Rez-de-chaussée",
                badge: "Amphithéâtre"
            )
        }

        // Ex: D004, E102, C203
        if let regex = try? NSRegularExpression(pattern: "\\b([A-F])(\\d{3})\\b", options: .caseInsensitive),
           let match = regex.firstMatch(in: text, range: NSRange(location: 0, length: text.utf16.count)),
           let letRange = Range(match.range(at: 1), in: text),
           let numRange = Range(match.range(at: 2), in: text) {
            let letter = String(text[letRange]).uppercased()
            let num = String(text[numRange])
            let floorDigit = num.first ?? "0"

            var floorName = "Rez-de-chaussée"
            if floorDigit == "1" { floorName = "1er étage" }
            else if floorDigit == "2" { floorName = "2ème étage" }
            else if floorDigit == "3" { floorName = "3ème étage" }

            var buildingName = "Bâtiment \(letter)"
            if letter == "D" { buildingName = "Bâtiment D (Maths & Info)" }
            else if letter == "C" { buildingName = "Bâtiment C (Chimie & Phys.)" }
            else if letter == "E" { buildingName = "Bâtiment E (Biologie)" }
            else if letter == "B" { buildingName = "Bâtiment B" }

            return CampusLocationInfo(
                building: buildingName,
                floor: floorName,
                badge: "Bât. \(letter) · Salle \(num) (\(floorName))"
            )
        }

        return nil
    }
}
