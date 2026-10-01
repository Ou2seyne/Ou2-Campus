import SwiftUI

public enum GazetteTheme {
    // Surfaces & Backgrounds
    public static func bg(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(hex: "#0F0F0E") : Color(hex: "#F5F3EE")
    }

    public static func surface(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(hex: "#1A1917") : Color(hex: "#FFFFFF")
    }

    public static func surface2(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(hex: "#232220") : Color(hex: "#EEECe8")
    }

    public static func surface3(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(hex: "#2D2C29") : Color(hex: "#E6E3DC")
    }

    // Texts
    public static func text(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(hex: "#F0EFEB") : Color(hex: "#0D0D0C")
    }

    public static func text2(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(hex: "#C6C4BF") : Color(hex: "#2E2D2B")
    }

    public static func muted(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(hex: "#9B9A97") : Color(hex: "#6B6A67")
    }

    public static func muted2(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(hex: "#6B6A67") : Color(hex: "#9B9A97")
    }

    // Borders
    public static func border(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(hex: "#302F2C") : Color(hex: "#D8D5CE")
    }

    public static func border2(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(hex: "#413F3B") : Color(hex: "#BAB7AF")
    }

    // Accent
    public static func accent(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(hex: "#4B8BF5") : Color(hex: "#0052CC")
    }

    public static func accentDim(for colorScheme: ColorScheme) -> Color {
        accent(for: colorScheme).opacity(colorScheme == .dark ? 0.16 : 0.12)
    }

    // Live status
    public static func livePulse(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(hex: "#4ADE80") : Color(hex: "#22C55E")
    }
    public static func liveBg(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(hex: "#0A1F10") : Color(hex: "#DCFCE7")
    }
    public static func liveBar(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(hex: "#4ADE80") : Color(hex: "#15803D")
    }
    public static func liveText(for colorScheme: ColorScheme) -> Color {
        colorScheme == .dark ? Color(hex: "#86EFAC") : Color(hex: "#14532D")
    }
}

// Extension utilitaire pour parser les codes hexadécimaux
extension Color {
    public init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }

    public static let emerald = Color(hex: "#16A34A")
}
