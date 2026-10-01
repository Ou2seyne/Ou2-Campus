import SwiftUI
import UIKit

public enum CalendarExporter {
    public static func generateIcs(for event: ScheduleEvent) -> URL? {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.dateFormat = "yyyyMMdd'T'HHmmss'Z'"

        let dtstamp = formatter.string(from: Date())
        let dtstart = formatter.string(from: event.dtstart)
        let dtend = formatter.string(from: event.dtend)

        let cleanTitle = event.cleanTitle.replacingOccurrences(of: "\n", with: " ")
        let cleanLocation = event.room.isEmpty ? event.location : "\(event.room) - \(event.location)"
        let cleanDesc = "\(event.category.title)\\nEnseignant: \(event.teacher)\\nGroupe: \(event.subGroup ?? "Tous")"

        let ics = """
        BEGIN:VCALENDAR
        VERSION:2.0
        PRODID:-//Aura Campus//Univ Artois ADE//FR
        CALSCALE:GREGORIAN
        METHOD:PUBLISH
        BEGIN:VEVENT
        UID:aura-\(event.id)@univ-artois.fr
        DTSTAMP:\(dtstamp)
        DTSTART:\(dtstart)
        DTEND:\(dtend)
        SUMMARY:\(cleanTitle)
        LOCATION:\(cleanLocation)
        DESCRIPTION:\(cleanDesc)
        STATUS:CONFIRMED
        END:VEVENT
        END:VCALENDAR
        """

        let tempDir = FileManager.default.temporaryDirectory
        let safeName = cleanTitle.components(separatedBy: .alphanumerics.inverted).joined(separator: "_")
        let fileUrl = tempDir.appendingPathComponent("\(safeName).ics")

        do {
            try ics.write(to: fileUrl, atomically: true, encoding: .utf8)
            return fileUrl
        } catch {
            print("Erreur création ICS: \(error)")
            return nil
        }
    }

    @MainActor
    public static func shareEvent(_ event: ScheduleEvent) {
        guard let url = generateIcs(for: event) else { return }

        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let rootVC = windowScene.windows.first?.rootViewController else {
            return
        }

        let activityVC = UIActivityViewController(activityItems: [url], applicationActivities: nil)
        if let popover = activityVC.popoverPresentationController {
            popover.sourceView = rootVC.view
            popover.sourceRect = CGRect(x: rootVC.view.bounds.midX, y: rootVC.view.bounds.midY, width: 0, height: 0)
            popover.permittedArrowDirections = []
        }

        // Find top most viewController
        var topController = rootVC
        while let presented = topController.presentedViewController {
            topController = presented
        }
        topController.present(activityVC, animated: true)
    }
}
