# Spin Lucky - Multiplayer Slot Game Design Guidelines

## Design Approach: Reference-Based (Casino Gaming)

**Primary References:** Classic Vegas slot machines, modern casino apps like DoubleDown Casino, Slotomania
**Visual Direction:** Polished casino aesthetic with vibrant colors, celebratory animations, and clear game mechanics
**Key Principle:** High-energy gaming experience with instant visual feedback and social excitement

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary)**
- Background: 15 15% 8% (deep charcoal, casino floor ambiance)
- Surface: 140 30% 12% (rich dark green, felt table)
- Primary/Brand: 142 65% 45% (vibrant emerald green - "lucky" theme)
- Accent/Gold: 45 95% 55% (bright gold for wins, highlights)
- Text Primary: 0 0% 98%
- Text Secondary: 0 0% 70%
- Win Glow: 45 100% 60% (bright gold celebration)
- Lose Indicator: 0 60% 55% (subtle red)

**Key Color Usage:**
- Green gradients for game container backgrounds
- Gold for win states, coins, multipliers, buttons
- White text with gold outlines for important numbers
- Subtle glow effects on active elements

### B. Typography

**Families:**
- Display/Numbers: 'Bebas Neue' or 'Rajdhani' (bold, casino-style)
- UI Text: 'Inter' or 'Roboto' (clean, readable)
- Decorative: 'Cinzel' for "SPIN LUCKY" logo

**Hierarchy:**
- Huge Numbers (Wins/Balance): 4xl to 6xl, bold, gold color
- Game Status: 2xl to 3xl, uppercase, tracking-wide
- Player Names: base to lg, semibold
- UI Labels: sm to base, medium weight
- Leaderboard Ranks: xl, bold with # prefix

### C. Layout System

**Spacing Primitives:** Use 2, 4, 6, 8, 12, 16 units
- Component padding: p-4 to p-8
- Section spacing: space-y-6 to space-y-8
- Grid gaps: gap-4 to gap-6
- Consistent vertical rhythm with py-8 for main containers

**Layout Structure:**
- **Main Game Area:** Center-dominant (60% width), slot machine takes visual priority
- **Left Sidebar (25%):** Player stats, balance, bet controls
- **Right Sidebar (15%):** Live feed + Leaderboard (stacked vertically)
- **Mobile:** Single column with game on top, controls below, collapsible sidebars

### D. Component Library

**1. Slot Machine (Hero Component)**
- 3 reels in metallic gold frames with green felt backing
- Symbol size: Large, clear, animated (120-150px)
- Reel container: Dark border with subtle inner glow
- Spin button: Massive circular gold button (120px) below reels
- Win lines: Animated gold lines connecting winning symbols
- Glass/shine overlay effect on reel frames

**2. Bet Controls**
- Coin selector: Radio buttons styled as gold coins with values
- Bet amount: Large number display with +/- buttons
- Max Bet: Distinct red/orange "MAX BET" button
- Auto-spin toggle: Switch with counter

**3. Balance Display**
- Prominent position top-left
- Coin icon + large number
- Subtle pulse animation on win
- History graph: Mini sparkline showing recent trend

**4. Live Player Feed (Right Sidebar)**
- Scrolling vertical feed
- Each entry: Avatar + Name + Result + Amount
- Win entries: Gold highlight with coin animation
- Loss entries: Subtle opacity
- Fade-in animation for new entries
- Max 10 visible, auto-scroll

**5. Real-time Leaderboard**
- Top 10 players
- Rank number in gold badge
- Player name + total winnings
- Crown icon for #1
- Subtle background for current user
- Update animation: Slide-in for position changes

**6. Game Room Status**
- Player count indicator (e.g., "🎰 247 players online")
- Room ID or name
- Connection status dot (green = connected)

**7. Win/Loss States**
- **Big Win:** Full-screen overlay with gold confetti, sound effect indicator
- **Win:** Pulsing gold glow around winning reels + amount popup
- **Loss:** Brief dim effect, quick recovery to neutral state
- Number counter animation for winnings

**8. Chat/Messages (Optional Bottom Bar)**
- Minimal chat input at bottom
- Quick reactions/emojis for wins
- Glass morphism background

### E. Visual Effects

**Animations (Purposeful Only):**
- Reel spin: Blur motion effect, 1.5-2s duration
- Win celebration: 0.5s gold flash + particle burst
- Coin flip: On balance update
- Leaderboard update: Smooth slide, 0.3s
- Button press: Scale down 0.95, 0.1s

**Avoid:**
- Continuous background animations
- Spinning elements when idle
- Excessive particle effects (reserve for big wins only)

### F. Symbols & Icons

**Slot Symbols (Use sprite sheet or icon library):**
- 🍒 Cherry (common)
- 💎 Diamond (medium)
- 🔔 Bell (medium)
- 7️⃣ Seven (rare, high value)
- ⬛ Bar (common)
- Each symbol should have matching + colored versions

**UI Icons:** Font Awesome or Heroicons
- Coins, crown, trophy for leaderboard
- Volume, settings, info
- Plus/minus for betting

## Images

**Background Texture:** Subtle dark green felt texture (10% opacity) for game container background

**Symbol Graphics:** Custom or premium slot machine symbol set with:
- Bright, saturated colors
- Clear outlines (gold or white)
- Consistent visual weight
- Slight 3D/emboss effect

**Avatar Placeholders:** Circular colored backgrounds with initials for players in feed/leaderboard

**No Hero Image:** Game interface IS the hero - full attention on the slot machine

## Responsive Behavior

**Desktop (1280px+):** 3-column layout with full sidebars
**Tablet (768-1279px):** 2-column, collapsible right sidebar
**Mobile (<768px):** Single column, game first, tabs for feed/leaderboard

## Accessibility Notes

- High contrast gold on dark green/black
- Clear win/loss states beyond color (size, position)
- Keyboard navigation for bet controls
- Screen reader labels for all game states
- Sound effect toggles clearly visible