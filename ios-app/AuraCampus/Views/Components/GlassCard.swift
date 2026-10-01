import SwiftUI

public struct GazetteCardModifier: ViewModifier {
    var cornerRadius: CGFloat = 2
    var borderType: BorderType = .standard

    public enum BorderType {
        case standard
        case strong
        case custom(Color)
    }

    @Environment(\.colorScheme) var colorScheme

    public func body(content: Content) -> some View {
        content
            .background(GazetteTheme.surface(for: colorScheme))
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .stroke(borderColor, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
    }

    private var borderColor: Color {
        switch borderType {
        case .standard:
            return GazetteTheme.border(for: colorScheme)
        case .strong:
            return GazetteTheme.border2(for: colorScheme)
        case .custom(let color):
            return color
        }
    }
}

extension View {
    public func gazetteCard(
        cornerRadius: CGFloat = 2,
        borderType: GazetteCardModifier.BorderType = .strong
    ) -> some View {
        modifier(GazetteCardModifier(cornerRadius: cornerRadius, borderType: borderType))
    }

    // Alias rétro-compatible avec liquidGlass pour éviter les erreurs de compilation
    public func liquidGlass(
        cornerRadius: CGFloat = 2,
        strokeOpacity: Double = 0.25,
        shadowRadius: CGFloat = 0
    ) -> some View {
        modifier(GazetteCardModifier(cornerRadius: cornerRadius, borderType: .strong))
    }

    public func tactileHaptic() -> some View {
        self.simultaneousGesture(TapGesture().onEnded {
            let impact = UIImpactFeedbackGenerator(style: .light)
            impact.impactOccurred()
        })
    }
}
