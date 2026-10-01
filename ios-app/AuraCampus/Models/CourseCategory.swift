import SwiftUI

public enum CourseCategory: String, Codable, CaseIterable, Identifiable, Sendable {
    case cm = "CM"
    case td = "TD"
    case tp = "TP"
    case exam = "EXAM"
    case projet = "PROJET"
    case autre = "AUTRE"

    public var id: String { rawValue }

    public var title: String {
        switch self {
        case .cm: return "Cours Magistral"
        case .td: return "Travaux Dirigés"
        case .tp: return "Travaux Pratiques"
        case .exam: return "Examen / Contrôle"
        case .projet: return "Projet / Workshop"
        case .autre: return "Autre activité"
        }
    }

    public var shortLabel: String {
        switch self {
        case .cm: return "CM"
        case .td: return "TD"
        case .tp: return "TP"
        case .exam: return "EXAM"
        case .projet: return "PROJET"
        case .autre: return "AUTRE"
        }
    }

    public var systemImage: String {
        switch self {
        case .cm: return "graduationcap.fill"
        case .td: return "book.fill"
        case .tp: return "desktopcomputer"
        case .exam: return "exclamationmark.triangle.fill"
        case .projet: return "hammer.fill"
        case .autre: return "calendar"
        }
    }

    // Barre latérale (4px)
    public func barColor(for scheme: ColorScheme) -> Color {
        switch self {
        case .cm:
            return scheme == .dark ? Color(hex: "#818CF8") : Color(hex: "#3730A3")
        case .td:
            return scheme == .dark ? Color(hex: "#F59E0B") : Color(hex: "#B45309")
        case .tp:
            return scheme == .dark ? Color(hex: "#4ADE80") : Color(hex: "#15803D")
        case .exam:
            return scheme == .dark ? Color(hex: "#F87171") : Color(hex: "#B91C1C")
        case .projet:
            return scheme == .dark ? Color(hex: "#A78BFA") : Color(hex: "#7C3AED")
        case .autre:
            return scheme == .dark ? Color(hex: "#94A3B8") : Color(hex: "#475569")
        }
    }

    // Fond teinté de la carte
    public func bgColor(for scheme: ColorScheme) -> Color {
        switch self {
        case .cm:
            return scheme == .dark ? Color(hex: "#1A1A35") : Color(hex: "#EEF0FD")
        case .td:
            return scheme == .dark ? Color(hex: "#2A1F08") : Color(hex: "#FEF3C7")
        case .tp:
            return scheme == .dark ? Color(hex: "#0A1F10") : Color(hex: "#DCFCE7")
        case .exam:
            return scheme == .dark ? Color(hex: "#200A0A") : Color(hex: "#FEE2E2")
        case .projet:
            return scheme == .dark ? Color(hex: "#180E2E") : Color(hex: "#EDE9FE")
        case .autre:
            return scheme == .dark ? Color(hex: "#1A2130") : Color(hex: "#E2E8F0")
        }
    }

    // Texte du badge ou accents
    public func textColor(for scheme: ColorScheme) -> Color {
        switch self {
        case .cm:
            return scheme == .dark ? Color(hex: "#A5B4FC") : Color(hex: "#1E1A70")
        case .td:
            return scheme == .dark ? Color(hex: "#FCD34D") : Color(hex: "#78350F")
        case .tp:
            return scheme == .dark ? Color(hex: "#86EFAC") : Color(hex: "#14532D")
        case .exam:
            return scheme == .dark ? Color(hex: "#FCA5A5") : Color(hex: "#7F1D1D")
        case .projet:
            return scheme == .dark ? Color(hex: "#C4B5FD") : Color(hex: "#4C1D95")
        case .autre:
            return scheme == .dark ? Color(hex: "#CBD5E1") : Color(hex: "#1E293B")
        }
    }

    // Alias rétro-compatible
    public var tintColor: Color {
        barColor(for: .light)
    }

    public var badge: String {
        shortLabel
    }
}
