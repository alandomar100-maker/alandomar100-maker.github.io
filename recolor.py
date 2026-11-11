#!/usr/bin/env python3
"""Recolor the Dahat-w-Xarji Android app from green to HawRega orange.
Runs in CI before the Gradle build. Repo sources are not modified on GitHub;
the colors are patched in the build checkout only."""
import os, re, sys

ROOT = os.path.join("app", "src")

COLOR_KT = '''package com.example.ui.theme

import androidx.compose.ui.graphics.Color

// HawRega palette (orange)
val WebsitePrimaryDark = Color(0xFFE85D04)
val WebsitePrimary = Color(0xFFFF6A00)
val WebsitePrimaryAccent = Color(0xFFFF7A1A)
val WebsitePrimaryLight = Color(0xFFFF9A3C)
val WebsitePrimaryContainer = Color(0xFFFFEBD6)
val WebsitePrimarySurface = Color(0xFFFFF6EC)

val WebsiteSurface = Color(0xFFFFF6EC)
val WebsiteSurfaceSubtle = Color(0xFFFFEBD6)
val WebsiteCardBg = Color(0xFFFFFFFF)
val WebsiteBorderSubtle = Color(0xFFFFE6CF)
val WebsiteBorderStrong = Color(0xFFFFD9B8)

val WebsiteGoldPrimary = Color(0xFFF59E0B)
val WebsiteGoldDark = Color(0xFFD97706)
val WebsiteGoldLight = Color(0xFFFDE047)
val WebsiteGoldBg = Color(0xFFFFFBEB)
val WebsiteGoldBorder = Color(0xFFFCD34D)

// Income stays green, expense stays red
val WebsiteIncomeGreen = Color(0xFF16A34A)
val WebsiteIncomeBg = Color(0xFFECFDF5)
val WebsiteIncomeBorder = Color(0xFFA7F3D0)

val WebsiteExpenseRed = Color(0xFFDC2626)
val WebsiteExpenseBg = Color(0xFFFEF2F2)
val WebsiteExpenseBorder = Color(0xFFFECACA)

val WebsiteTextDark = Color(0xFF3B2314)
val WebsiteTextMedium = Color(0xFF5C4030)
val WebsiteTextLight = Color(0xFF8A6A55)
val WebsiteTextMuted = Color(0xFFB79A86)

val EmeraldGreenDark = WebsitePrimaryDark
val EmeraldGreenPrimary = WebsitePrimaryAccent
val EmeraldGreenLight = WebsitePrimaryLight
val EmeraldGreenContainer = WebsitePrimaryContainer
val EmeraldGreenSurface = WebsiteSurface

val IncomeGreen = WebsiteIncomeGreen
val IncomeGreenLight = Color(0xFFF0FDF4)
val IncomeGreenBorder = WebsiteIncomeBorder

val ExpenseRed = WebsiteExpenseRed
val ExpenseRedLight = WebsiteExpenseBg
val ExpenseRedBorder = WebsiteExpenseBorder

val ZeroNeutral = Color(0xFF3B2314)
val ZeroNeutralLight = Color(0xFFFFF6EC)
val ZeroNeutralBorder = Color(0xFFFFD9B8)

val FinancialGold = WebsiteGoldPrimary
val PureWhite = Color(0xFFFFFFFF)
val TextDark = WebsiteTextDark
val TextMedium = WebsiteTextMedium
val TextLight = WebsiteTextLight

val DinarchiEmeraldDeep = WebsitePrimary
val DinarchiEmeraldForest = Color(0xFF2A1B12)
val DinarchiEmeraldPrimary = WebsitePrimaryAccent
val DinarchiEmeraldAccent = WebsitePrimaryLight
val DinarchiEmeraldContainer = WebsitePrimaryContainer
val DinarchiEmeraldBorder = WebsiteBorderStrong
val DinarchiSlateBg = WebsiteSurface
val DinarchiSlateCard = WebsiteCardBg
val DinarchiSlateBorder = WebsiteBorderStrong
val DinarchiSlateBorderSubtle = WebsiteBorderSubtle
val DinarchiGoldPrimary = WebsiteGoldDark
val DinarchiGoldContainer = WebsiteGoldBg
val DinarchiGoldBorder = WebsiteGoldBorder
'''

# Applied to every .kt file except Color.kt (brand greens / green-tinted neutrals only)
COMMON = {
    "083B2E": "E85D04", "0B4636": "FF6A00", "0D684D": "FF7A1A", "081F1A": "2A1B12",
    "0F1711": "3B2314", "111813": "3B2314", "0D3B12": "3B2314", "2C3E30": "5C4030",
    "C8D6CA": "FFD9B8",
    # Theme.kt dark scheme
    "121814": "1F140D", "1A221C": "2A1B12", "E8F0EA": "FFF1E4",
    "263329": "3A261A", "BDC9BF": "D9BFA8",
}

# Screens that are purely brand-colored (no income/expense meaning) get a full swap
CALC = {
    "047857": "E85D04", "34D399": "FFE0B8", "A7F3D0": "FFD9B8", "07211B": "1F140D",
    "065F46": "5C3A22", "6EE7B7": "FFC38A", "059669": "FF7A1A", "10B981": "FF9A3C",
    "132A24": "3A261A",
}
MARKETS = {
    "047857": "E85D04", "10B981": "FF9A3C", "A7F3D0": "FFD9B8", "D1FAE5": "FFEBD6",
    "34D399": "FFE0B8", "065F46": "D9560B", "ECFDF5": "FFEBD6", "008C45": "E85D04",
    "F0FDF4": "FFF6EC", "86EFAC": "FFD9B8", "166534": "9A3E03", "15803D": "B84A04",
    "BBF7D0": "FFD9B8", "059669": "E85D04",
}
SPLASH = {
    "1E6B27": "FF9A3C", "144D1C": "FF6A00", "0A2B0F": "C94A00",
    "2E7D32": "D9560B", "1B5E20": "B84A04", "81C784": "FFC38A", "D4E6D6": "FFE9D6",
}
YEARS = {"DCFCE7": "FFEBD6", "16A34A": "FFB366", "15803D": "E85D04", "064E1A": "7A3300", "E8F5E9": "FFEBD6"}
MONTHS = {"E8F5E9": "FFEBD6"}
TRANSACTIONS = {"DCFCE7": "FFEBD6", "16A34A": "FFB366"}

PER_FILE = {
    "CalculatorScreen.kt": CALC, "MarketsScreen.kt": MARKETS, "SplashScreen.kt": SPLASH,
    "YearsScreen.kt": YEARS, "MonthsScreen.kt": MONTHS, "TransactionsScreen.kt": TRANSACTIONS,
}


HEX = re.compile(r"0xFF([0-9A-Fa-f]{6})")

def recolor(text, mapping):
    def sub(m):
        key = m.group(1).upper()
        return "0xFF" + mapping.get(key, m.group(1))
    return HEX.sub(sub, text)

# ---------- targeted fixes (run BEFORE the hex mapping) ----------
PRIMARY = "MaterialTheme.colorScheme.primary"
def label_fix(fn_name, size, old_hex):
    return (re.compile(
        r"(text = Localization\." + fn_name + r"\(language\),\s*fontSize = " + size +
        r"\.sp,\s*fontWeight = FontWeight\.ExtraBold,\s*color = )Color\(0xFF" + old_hex + r"\)"),
        r"\1" + PRIMARY)

LOGO_RE = re.compile(r"Image\(\s*painter = painterResource\(id = R\.drawable\.app_icon_website\),.*?contentScale = ContentScale\.Fit\s*\)", re.S)
LOGO_NEW = ("Box(modifier = Modifier.size(36.dp).clip(CircleShape).background(Color.White), "
            "contentAlignment = Alignment.Center) { Icon(imageVector = Icons.Default.AccountBalanceWallet, "
            "contentDescription = null, tint = Color(0xFFE85D04), modifier = Modifier.size(22.dp)) }")

SPECIFIC = {
    "YearsScreen.kt": [
        (LOGO_RE, LOGO_NEW),
        (re.compile(r"(import androidx\.compose\.material\.icons\.Icons\n)"),
         r"\1import androidx.compose.material.icons.filled.AccountBalanceWallet\n"),
        label_fix("getSummaryLabel", "16", "0F1711"),
        label_fix("getSelectYearTitle", "18", "0F1711"),
    ],
    "MonthsScreen.kt": [label_fix("getMonthLabel", "18", "111813")],
    "TransactionsScreen.kt": [
        (re.compile(r"(text = Localization\.getNoTransactionsMessage\(language\),\s*textAlign = TextAlign\.Center,\s*color = )Color\(0xFF0F1711\)"),
         r"\1" + PRIMARY),
        (re.compile(r"(tint = )Color\(0xFF15803D\)(,\s*modifier = Modifier\s*\.padding\(24\.dp\))"),
         r"\1Color(0xFFE85D04)\2"),
    ],
    "Theme.kt": [
        (re.compile(r"(onSecondary = PureWhite,)"),
         r"\1\n    secondaryContainer = EmeraldGreenContainer,\n    onSecondaryContainer = EmeraldGreenDark,"),
        (re.compile(r"(onSecondary = Color\.White,)"),
         r"\1\n    secondaryContainer = Color(0xFF4A2C17),\n    onSecondaryContainer = Color(0xFFFFD9B8),"),
    ],
}

# ---------- launcher icon (wallet + coin + income/expense arrows) ----------
ICON_BG = """<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:aapt="http://schemas.android.com/aapt"
    android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
    <path android:pathData="M0,0h108v108h-108z">
        <aapt:attr name="android:fillColor">
            <gradient android:startX="0" android:startY="0" android:endX="108" android:endY="108" android:type="linear">
                <item android:offset="0" android:color="#FFFFB04C"/>
                <item android:offset="0.55" android:color="#FFFF7A1A"/>
                <item android:offset="1" android:color="#FFD14F00"/>
            </gradient>
        </aapt:attr>
    </path>
    <path android:fillColor="#2EFFFFFF" android:pathData="M-10,20a36,36 0 1,0 72,0a36,36 0 1,0 -72,0z"/>
    <path android:fillColor="#14FFFFFF" android:pathData="M20,54a34,34 0 1,0 68,0a34,34 0 1,0 -68,0z"/>
    <path android:fillColor="#14FFFFFF" android:pathData="M26,54a28,28 0 1,0 56,0a28,28 0 1,0 -56,0z"/>
    <path android:strokeColor="#8CFFFFFF" android:strokeWidth="1" android:pathData="M8,54a46,46 0 1,0 92,0a46,46 0 1,0 -92,0z"/>
    <path android:strokeColor="#B3FFFFFF" android:strokeWidth="1.1" android:pathData="M14,54a40,40 0 1,0 80,0a40,40 0 1,0 -80,0z"/>
    <path android:strokeColor="#A6FFFFFF" android:strokeWidth="1" android:pathData="M23,23L85,23L85,85L23,85z"/>
    <path android:strokeColor="#A6FFFFFF" android:strokeWidth="1" android:pathData="M54,10L98,54L54,98L10,54z"/>
    <path android:strokeColor="#80FFFFFF" android:strokeWidth="0.9" android:pathData="M30,54a24,24 0 1,0 48,0a24,24 0 1,0 -48,0z"/>
    <path android:fillColor="#E6FFFFFF" android:pathData="M94.9,71.6a1.6,1.6 0 1,0 3.2,0a1.6,1.6 0 1,0 -3.2,0z"/>
    <path android:fillColor="#E6FFFFFF" android:pathData="M70,96.5a1.6,1.6 0 1,0 3.2,0a1.6,1.6 0 1,0 -3.2,0z"/>
    <path android:fillColor="#E6FFFFFF" android:pathData="M34.8,96.5a1.6,1.6 0 1,0 3.2,0a1.6,1.6 0 1,0 -3.2,0z"/>
    <path android:fillColor="#E6FFFFFF" android:pathData="M9.9,71.6a1.6,1.6 0 1,0 3.2,0a1.6,1.6 0 1,0 -3.2,0z"/>
    <path android:fillColor="#E6FFFFFF" android:pathData="M9.9,36.4a1.6,1.6 0 1,0 3.2,0a1.6,1.6 0 1,0 -3.2,0z"/>
    <path android:fillColor="#E6FFFFFF" android:pathData="M34.8,11.5a1.6,1.6 0 1,0 3.2,0a1.6,1.6 0 1,0 -3.2,0z"/>
    <path android:fillColor="#E6FFFFFF" android:pathData="M70,11.5a1.6,1.6 0 1,0 3.2,0a1.6,1.6 0 1,0 -3.2,0z"/>
    <path android:fillColor="#E6FFFFFF" android:pathData="M94.9,36.4a1.6,1.6 0 1,0 3.2,0a1.6,1.6 0 1,0 -3.2,0z"/>
    <path android:fillColor="#CCFFFFFF" android:pathData="M92.9,54a1.1,1.1 0 1,0 2.2,0a1.1,1.1 0 1,0 -2.2,0z"/>
    <path android:fillColor="#CCFFFFFF" android:pathData="M81.18,82.28a1.1,1.1 0 1,0 2.2,0a1.1,1.1 0 1,0 -2.2,0z"/>
    <path android:fillColor="#CCFFFFFF" android:pathData="M52.9,94a1.1,1.1 0 1,0 2.2,0a1.1,1.1 0 1,0 -2.2,0z"/>
    <path android:fillColor="#CCFFFFFF" android:pathData="M24.62,82.28a1.1,1.1 0 1,0 2.2,0a1.1,1.1 0 1,0 -2.2,0z"/>
    <path android:fillColor="#CCFFFFFF" android:pathData="M12.9,54a1.1,1.1 0 1,0 2.2,0a1.1,1.1 0 1,0 -2.2,0z"/>
    <path android:fillColor="#CCFFFFFF" android:pathData="M24.62,25.72a1.1,1.1 0 1,0 2.2,0a1.1,1.1 0 1,0 -2.2,0z"/>
    <path android:fillColor="#CCFFFFFF" android:pathData="M52.9,14a1.1,1.1 0 1,0 2.2,0a1.1,1.1 0 1,0 -2.2,0z"/>
    <path android:fillColor="#CCFFFFFF" android:pathData="M81.18,25.72a1.1,1.1 0 1,0 2.2,0a1.1,1.1 0 1,0 -2.2,0z"/>
</vector>
"""
ICON_FG = """<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
    <group android:scaleX="0.9" android:scaleY="0.9" android:pivotX="54" android:pivotY="54">
        <path android:fillColor="#2B000000" android:pathData="M32,82h44a2,2 0 0 1 2,2v0a2,2 0 0 1 -2,2h-44a2,2 0 0 1 -2,-2v0a2,2 0 0 1 2,-2z"/>
        <group android:rotation="-10" android:pivotX="54" android:pivotY="50">
            <path android:fillColor="#FFE3B8" android:strokeColor="#F0B866" android:strokeWidth="0.9" android:pathData="M36,26h34a3,3 0 0 1 3,3v18a3,3 0 0 1 -3,3h-34a3,3 0 0 1 -3,-3v-18a3,3 0 0 1 3,-3z"/>
            <path android:strokeColor="#E39A3B" android:strokeWidth="0.6" android:pathData="M37.5,28.5h31a2,2 0 0 1 2,2v15a2,2 0 0 1 -2,2h-31a2,2 0 0 1 -2,-2v-15a2,2 0 0 1 2,-2z"/>
            <path android:strokeColor="#E39A3B" android:strokeWidth="0.8" android:pathData="M47.8,38a5.2,5.2 0 1,0 10.4,0a5.2,5.2 0 1,0 -10.4,0z"/>
            <path android:fillColor="#E39A3B" android:pathData="M50.7,38a2.3,2.3 0 1,0 4.6,0a2.3,2.3 0 1,0 -4.6,0z"/>
            <path android:fillColor="#E39A3B" android:pathData="M38.2,32.5a1.3,1.3 0 1,0 2.6,0a1.3,1.3 0 1,0 -2.6,0z"/>
            <path android:fillColor="#E39A3B" android:pathData="M65.2,43.5a1.3,1.3 0 1,0 2.6,0a1.3,1.3 0 1,0 -2.6,0z"/>
            <path android:fillColor="#E39A3B" android:pathData="M38.2,43.5a1.3,1.3 0 1,0 2.6,0a1.3,1.3 0 1,0 -2.6,0z"/>
            <path android:fillColor="#E39A3B" android:pathData="M65.2,32.5a1.3,1.3 0 1,0 2.6,0a1.3,1.3 0 1,0 -2.6,0z"/>
            <path android:strokeColor="#E39A3B" android:strokeWidth="0.8" android:strokeLineCap="round" android:pathData="M42.5,38L46.5,38"/>
            <path android:strokeColor="#E39A3B" android:strokeWidth="0.8" android:strokeLineCap="round" android:pathData="M59.5,38L63.5,38"/>
        </group>
        <group android:rotation="8" android:pivotX="54" android:pivotY="50">
            <path android:fillColor="#FFF4DC" android:strokeColor="#F5C27A" android:strokeWidth="0.9" android:pathData="M38,22h34a3,3 0 0 1 3,3v18a3,3 0 0 1 -3,3h-34a3,3 0 0 1 -3,-3v-18a3,3 0 0 1 3,-3z"/>
            <path android:strokeColor="#E8A95C" android:strokeWidth="0.6" android:pathData="M39.5,24.5h31a2,2 0 0 1 2,2v15a2,2 0 0 1 -2,2h-31a2,2 0 0 1 -2,-2v-15a2,2 0 0 1 2,-2z"/>
            <path android:strokeColor="#E8A95C" android:strokeWidth="0.8" android:pathData="M49.8,34a5.2,5.2 0 1,0 10.4,0a5.2,5.2 0 1,0 -10.4,0z"/>
            <path android:fillColor="#E8A95C" android:pathData="M52.7,34a2.3,2.3 0 1,0 4.6,0a2.3,2.3 0 1,0 -4.6,0z"/>
            <path android:fillColor="#E8A95C" android:pathData="M40.2,28.5a1.3,1.3 0 1,0 2.6,0a1.3,1.3 0 1,0 -2.6,0z"/>
            <path android:fillColor="#E8A95C" android:pathData="M67.2,39.5a1.3,1.3 0 1,0 2.6,0a1.3,1.3 0 1,0 -2.6,0z"/>
            <path android:fillColor="#E8A95C" android:pathData="M40.2,39.5a1.3,1.3 0 1,0 2.6,0a1.3,1.3 0 1,0 -2.6,0z"/>
            <path android:fillColor="#E8A95C" android:pathData="M67.2,28.5a1.3,1.3 0 1,0 2.6,0a1.3,1.3 0 1,0 -2.6,0z"/>
            <path android:strokeColor="#E8A95C" android:strokeWidth="0.8" android:strokeLineCap="round" android:pathData="M44.5,34L48.5,34"/>
            <path android:strokeColor="#E8A95C" android:strokeWidth="0.8" android:strokeLineCap="round" android:pathData="M61.5,34L65.5,34"/>
        </group>
        <path android:fillColor="#FFFFFF" android:pathData="M34,44h40a8,8 0 0 1 8,8v22a8,8 0 0 1 -8,8h-40a8,8 0 0 1 -8,-8v-22a8,8 0 0 1 8,-8z"/>
        <path android:fillColor="#FFEBD6" android:pathData="M32.5,47h43a3.5,3.5 0 0 1 3.5,3.5v0a3.5,3.5 0 0 1 -3.5,3.5h-43a3.5,3.5 0 0 1 -3.5,-3.5v-0a3.5,3.5 0 0 1 3.5,-3.5z"/>
        <path android:fillColor="#12B84A04" android:pathData="M34,74h40a8,8 0 0 1 8,8v-8a8,8 0 0 1 -8,8h-40a8,8 0 0 1 -8,-8v8a8,8 0 0 1 8,-8z"/>
        <path android:strokeColor="#F2B27B" android:strokeWidth="0.9" android:strokeLineCap="round" android:pathData="M30.5,58.6L32.7,58.6"/>
        <path android:strokeColor="#F2B27B" android:strokeWidth="0.9" android:strokeLineCap="round" android:pathData="M34.4,58.6L36.6,58.6"/>
        <path android:strokeColor="#F2B27B" android:strokeWidth="0.9" android:strokeLineCap="round" android:pathData="M38.3,58.6L40.5,58.6"/>
        <path android:strokeColor="#F2B27B" android:strokeWidth="0.9" android:strokeLineCap="round" android:pathData="M42.2,58.6L44.4,58.6"/>
        <path android:strokeColor="#F2B27B" android:strokeWidth="0.9" android:strokeLineCap="round" android:pathData="M46.1,58.6L48.3,58.6"/>
        <path android:strokeColor="#F2B27B" android:strokeWidth="0.9" android:strokeLineCap="round" android:pathData="M50,58.6L52.2,58.6"/>
        <path android:strokeColor="#F2B27B" android:strokeWidth="0.9" android:strokeLineCap="round" android:pathData="M53.9,58.6L56.1,58.6"/>
        <path android:strokeColor="#F2B27B" android:strokeWidth="0.9" android:strokeLineCap="round" android:pathData="M57.8,58.6L60,58.6"/>
        <path android:strokeColor="#F2B27B" android:strokeWidth="0.9" android:strokeLineCap="round" android:pathData="M61.7,58.6L63.9,58.6"/>
        <path android:strokeColor="#F2B27B" android:strokeWidth="0.9" android:strokeLineCap="round" android:pathData="M32,77.2L34.2,77.2"/>
        <path android:strokeColor="#F2B27B" android:strokeWidth="0.9" android:strokeLineCap="round" android:pathData="M35.9,77.2L38.1,77.2"/>
        <path android:strokeColor="#F2B27B" android:strokeWidth="0.9" android:strokeLineCap="round" android:pathData="M39.8,77.2L42,77.2"/>
        <path android:strokeColor="#F2B27B" android:strokeWidth="0.9" android:strokeLineCap="round" android:pathData="M43.7,77.2L45.9,77.2"/>
        <path android:strokeColor="#F2B27B" android:strokeWidth="0.9" android:strokeLineCap="round" android:pathData="M47.6,77.2L49.8,77.2"/>
        <path android:strokeColor="#F2B27B" android:strokeWidth="0.9" android:strokeLineCap="round" android:pathData="M51.5,77.2L53.7,77.2"/>
        <path android:strokeColor="#F2B27B" android:strokeWidth="0.9" android:strokeLineCap="round" android:pathData="M55.4,77.2L57.6,77.2"/>
        <path android:strokeColor="#F2B27B" android:strokeWidth="0.9" android:strokeLineCap="round" android:pathData="M59.3,77.2L61.5,77.2"/>
        <path android:strokeColor="#F2B27B" android:strokeWidth="0.9" android:strokeLineCap="round" android:pathData="M63.2,77.2L65.4,77.2"/>
        <path android:strokeColor="#F2B27B" android:strokeWidth="0.9" android:strokeLineCap="round" android:pathData="M67.1,77.2L69.3,77.2"/>
        <path android:strokeColor="#F2B27B" android:strokeWidth="0.9" android:strokeLineCap="round" android:pathData="M71,77.2L73.2,77.2"/>
        <path android:strokeColor="#F2B27B" android:strokeWidth="0.9" android:strokeLineCap="round" android:pathData="M74.9,77.2L76,77.2"/>
        <path android:fillColor="#FF9A3C" android:pathData="M37,65.2L39.8,68L37,70.8L34.2,68z"/>
        <path android:fillColor="#FFD9B8" android:pathData="M39.6,68a0.9,0.9 0 1,0 1.8,0a0.9,0.9 0 1,0 -1.8,0z"/>
        <path android:fillColor="#FFC38A" android:pathData="M44,65.2L46.8,68L44,70.8L41.2,68z"/>
        <path android:fillColor="#FFD9B8" android:pathData="M46.6,68a0.9,0.9 0 1,0 1.8,0a0.9,0.9 0 1,0 -1.8,0z"/>
        <path android:fillColor="#FF9A3C" android:pathData="M51,65.2L53.8,68L51,70.8L48.2,68z"/>
        <path android:fillColor="#FFD9B8" android:pathData="M53.6,68a0.9,0.9 0 1,0 1.8,0a0.9,0.9 0 1,0 -1.8,0z"/>
        <path android:fillColor="#FFC38A" android:pathData="M58,65.2L60.8,68L58,70.8L55.2,68z"/>
        <path android:fillColor="#E85D04" android:pathData="M70,58h12a4,4 0 0 1 4,4v6a4,4 0 0 1 -4,4h-12a4,4 0 0 1 -4,-4v-6a4,4 0 0 1 4,-4z"/>
        <path android:fillColor="#33FFFFFF" android:pathData="M69.7,59.4h12.6a2.3,2.3 0 0 1 2.3,2.3v0a2.3,2.3 0 0 1 -2.3,2.3h-12.6a2.3,2.3 0 0 1 -2.3,-2.3v-0a2.3,2.3 0 0 1 2.3,-2.3z"/>
        <path android:fillColor="#FFEBD6" android:pathData="M71.8,66a4.2,4.2 0 1,0 8.4,0a4.2,4.2 0 1,0 -8.4,0z"/>
        <path android:fillColor="#E85D04" android:pathData="M73.7,66a2.3,2.3 0 1,0 4.6,0a2.3,2.3 0 1,0 -4.6,0z"/>
        <path android:fillColor="#B3FFFFFF" android:pathData="M74.5,65.2a0.7,0.7 0 1,0 1.4,0a0.7,0.7 0 1,0 -1.4,0z"/>
        <path android:fillColor="#E6FFFFFF" android:pathData="M30,32.2L31.06,34.94L33.8,36L31.06,37.06L30,39.8L28.94,37.06L26.2,36L28.94,34.94z"/>
        <path android:fillColor="#CCFFFFFF" android:pathData="M80,31L80.84,33.16L83,34L80.84,34.84L80,37L79.16,34.84L77,34L79.16,33.16z"/>
        <path android:fillColor="#B3FFFFFF" android:pathData="M84,47.8L84.62,49.38L86.2,50L84.62,50.62L84,52.2L83.38,50.62L81.8,50L83.38,49.38z"/>
        <path android:fillColor="#B3FFFFFF" android:pathData="M24,67.6L24.67,69.33L26.4,70L24.67,70.67L24,72.4L23.33,70.67L21.6,70L23.33,69.33z"/>
    </group>
</vector>
"""
ICON_XML = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_hawrega_bg"/>
    <foreground android:drawable="@drawable/ic_hawrega_fg"/>
</adaptive-icon>
"""


# ---------- FinancialSummaryCard.kt: side-by-side silver/gold squares + orange zero-balance frame ----------
NEW_CARDS = """@Composable
private fun SilverMarketCard(
    marketRates: MarketRatesState,
    language: AppLanguage,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .clip(RoundedCornerShape(18.dp))
            .testTag("silver_rate_card"),
        color = PureWhite,
        shape = RoundedCornerShape(18.dp),
        border = BorderStroke(1.6.dp, Color(0xFFC3CAD3)),
        shadowElevation = 2.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(30.dp)
                        .background(Color(0xFFEEF1F5), CircleShape)
                        .border(1.2.dp, Color(0xFF9CA6B5), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(com.example.R.drawable.ic_silver_bar),
                        contentDescription = "Silver",
                        tint = Color.Unspecified,
                        modifier = Modifier.size(19.dp)
                    )
                }
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = Localization.getSilverPricesSectionTitle(language),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color(0xFF5F6B7A),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f)
                )
            }

            Surface(
                shape = RoundedCornerShape(8.dp),
                color = Color(0xFFEEF1F5),
                border = BorderStroke(1.dp, Color(0xFFC3CAD3))
            ) {
                Text(
                    text = GoldUnit.GRAM.getDisplayName(language),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF5F6B7A),
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                )
            }

            val silverPerGramIqd = marketRates.getSilverPrice(GoldUnit.GRAM, com.example.data.model.CurrencyType.IQD)

            if (silverPerGramIqd != null && silverPerGramIqd > 0.0) {
                Text(
                    text = Localization.formatIqd(silverPerGramIqd, language),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFF4B5563),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = "1 ${GoldUnit.GRAM.getDisplayName(language)}",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF6B7280),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            } else {
                Text(
                    text = Localization.getPriceUnavailableLabel(language),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFFDC2626)
                )
            }

            Spacer(modifier = Modifier.weight(1f))

            val silverTime = marketRates.silverTimestamp.takeIf { it.isNotBlank() } ?: marketRates.lastUpdatedTimeStr
            Text(
                text = "${Localization.getLastUpdatedPrefix(language)}: ${if (silverTime.isNotBlank()) silverTime else "--:--"}",
                fontSize = 9.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF7B8794),
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
private fun GoldMarketCard(
    marketRates: MarketRatesState,
    selectedGoldCarat: GoldCarat,
    selectedGoldUnit: GoldUnit,
    language: AppLanguage,
    onGoldSettingsClick: (() -> Unit)?,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .clip(RoundedCornerShape(18.dp))
            .testTag("gold_rate_card"),
        color = PureWhite,
        shape = RoundedCornerShape(18.dp),
        border = BorderStroke(1.6.dp, Color(0xFFFDE68A)),
        shadowElevation = 2.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(30.dp)
                        .background(Color(0xFFFEF3C7), CircleShape)
                        .border(1.2.dp, Color(0xFFD97706), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(com.example.R.drawable.ic_gold_bar),
                        contentDescription = "Gold",
                        tint = Color.Unspecified,
                        modifier = Modifier.size(19.dp)
                    )
                }
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = Localization.getGoldPriceLabel(language),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color(0xFF92400E),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f)
                )
            }

            if (onGoldSettingsClick != null) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Color(0xFFFEF3C7),
                    border = BorderStroke(1.dp, Color(0xFFD97706)),
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .clickable { onGoldSettingsClick() }
                        .testTag("gold_settings_button")
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = selectedGoldCarat.getDisplayName(language),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Black,
                            color = Color(0xFF92400E)
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Icon(
                            imageVector = Icons.Default.Tune,
                            contentDescription = Localization.getGoldPurityLabel(language),
                            tint = Color(0xFF92400E),
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }
            }

            val goldPrice = marketRates.getGoldPrice(selectedGoldCarat, selectedGoldUnit)
            if (goldPrice != null && goldPrice > 0.0) {
                Text(
                    text = Localization.formatIqd(goldPrice, language),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFFB45309),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = "1 ${selectedGoldUnit.getDisplayName(language)} • ${selectedGoldCarat.getDisplayName(language)}",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF78350F),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            } else {
                Text(
                    text = Localization.getPriceUnavailableLabel(language),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFFDC2626)
                )
                Text(
                    text = Localization.getGoldUnavailableMessage(language),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF94A3B8),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }

            Spacer(modifier = Modifier.weight(1f))

            val goldTime = marketRates.getGoldTimestamp(selectedGoldCarat)
            Text(
                text = "${Localization.getLastUpdatedPrefix(language)}: ${if (goldTime.isNotBlank()) goldTime else "--:--"}",
                fontSize = 9.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF8A6A55),
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

"""

SIDE_BY_SIDE = """Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(IntrinsicSize.Max),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                GoldMarketCard(
                    marketRates = marketRates,
                    selectedGoldCarat = selectedGoldCarat,
                    selectedGoldUnit = selectedGoldUnit,
                    language = language,
                    onGoldSettingsClick = onGoldSettingsClick,
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                )
                SilverMarketCard(
                    marketRates = marketRates,
                    language = language,
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                )
            }"""

def refresh_fix(pre, post_rx=r""):
    return (re.compile(pre + r"Color\(0xFF15803D\)"), lambda m: m.group(1) + "Color(0xFFE85D04)")

SPECIFIC["FinancialSummaryCard.kt"] = [
    (re.compile(r"(import androidx\.compose\.foundation\.layout\.Column\n)"),
     lambda m: m.group(1) + "import androidx.compose.foundation.layout.IntrinsicSize\nimport androidx.compose.foundation.layout.fillMaxHeight\nimport androidx.compose.foundation.layout.fillMaxSize\n"),
    (re.compile(r"(import androidx\.compose\.material3\.Icon\n)"),
     lambda m: m.group(1) + "import androidx.compose.material3.MaterialTheme\n"),
    # silver + gold side by side
    (re.compile(r"SilverMarketCard\(\s*marketRates = marketRates,\s*language = language,\s*modifier = Modifier\.fillMaxWidth\(\)\s*\)\s*GoldMarketCard\(\s*marketRates = marketRates,\s*selectedGoldCarat = selectedGoldCarat,\s*selectedGoldUnit = selectedGoldUnit,\s*language = language,\s*onGoldSettingsClick = onGoldSettingsClick,\s*modifier = Modifier\.fillMaxWidth\(\)\s*\)"),
     lambda m: SIDE_BY_SIDE),
    # new compact card bodies
    (re.compile(r"@Composable\s+private fun SilverMarketCard\(.*?(?=@Composable\s+private fun MainBalanceCard\()", re.S),
     lambda m: NEW_CARDS),
    # live-market label readable on dark background
    (re.compile(r"(text = Localization\.getLiveMarketBadge\(language\),\s*fontSize = 13\.sp,\s*fontWeight = FontWeight\.ExtraBold,\s*color = )Color\(0xFF0F172A\)"),
     lambda m: m.group(1) + PRIMARY),
    # refresh button -> orange
    refresh_fix(r"(CircularProgressIndicator\(\s*modifier = Modifier\.size\(13\.dp\),\s*strokeWidth = 1\.8\.dp,\s*color = )"),
    refresh_fix(r"(contentDescription = Localization\.getRefreshPricesLabel\(language\),\s*tint = )"),
    refresh_fix(r"(text = Localization\.getRefreshPricesLabel\(language\),\s*fontSize = 11\.sp,\s*fontWeight = FontWeight\.ExtraBold,\s*color = )"),
    # zero-balance frame -> orange (positive stays green, debt stays red)
    (re.compile(r"(BalanceStatus\.ZERO -> \{\s*cardBackground = )Color\(0xFFF8FAFC\)(\s*borderColor = )Color\(0xFF94A3B8\)(\s*primaryTextColor = )Color\(0xFF0F172A\)"),
     lambda m: m.group(1) + "Color(0xFFFFF1E4)" + m.group(2) + "Color(0xFFFF9A3C)" + m.group(3) + "Color(0xFFB84A04)"),
]
PER_FILE["FinancialSummaryCard.kt"] = {"F1F5F9": "FFEBD6", "CBD5E1": "FFC38A", "1E293B": "5C4030"}


USD_MAP = {"A7F3D0": "FFC38A", "ECFDF5": "FFEBD6", "008C45": "E85D04", "065F46": "B84A04",
           "DCFCE7": "FFEBD6", "166534": "9A3E03"}
SPECIFIC["FinancialSummaryCard.kt"].insert(2, (
    re.compile(r"private fun UsdMarketCard\(.*?(?=@Composable\s+private fun SilverMarketCard\()", re.S),
    lambda m: recolor(m.group(0), USD_MAP)))
SPECIFIC["Theme.kt"].append((
    re.compile(r"darkTheme: Boolean = isSystemInDarkTheme\(\),"),
    lambda m: "darkTheme: Boolean = false,"))


# ---------- AccountSyncDialog.kt: grey/slate + green avatar -> orange ----------
SPECIFIC["AccountSyncDialog.kt"] = [
    (re.compile(r"(Icons\.Default\.(?:Email|Lock|Security), contentDescription = null, tint = )Color\(0xFF64748B\)"),
     lambda m: m.group(1) + "Color(0xFFE85D04)"),
    (re.compile(r'(contentDescription = "Toggle password visibility",\s*tint = )Color\(0xFF64748B\)'),
     lambda m: m.group(1) + "Color(0xFFE85D04)"),
]
PER_FILE["AccountSyncDialog.kt"] = {
    "ECFDF5": "FFEBD6", "A7F3D0": "FFC38A", "0F172A": "3B2314", "475569": "8A6A55",
    "CBD5E1": "FFC38A", "E2E8F0": "FFD9B8", "F8FAFC": "FFF6EC", "F1F5F9": "FFEBD6",
    "64748B": "8A6A55", "94A3B8": "B08A70", "1E293B": "5C4030", "334155": "5C4030",
    "064E3B": "E85D04", "93C5FD": "FFC38A",
}


# ---------- AuthManager.kt: show the installed APK's SHA-1 inside the existing diagnostic box ----------
APK_SHA1_FN = """    private fun apkSha1(): String = try {
        val pm = context.packageManager
        val sigs = if (android.os.Build.VERSION.SDK_INT >= 28) {
            pm.getPackageInfo(context.packageName, android.content.pm.PackageManager.GET_SIGNING_CERTIFICATES)
                .signingInfo?.apkContentsSigners
        } else {
            @Suppress("DEPRECATION")
            pm.getPackageInfo(context.packageName, android.content.pm.PackageManager.GET_SIGNATURES).signatures
        }
        val bytes = sigs?.firstOrNull()?.toByteArray()
        if (bytes == null) "n/a" else java.security.MessageDigest.getInstance("SHA-1").digest(bytes).joinToString(":") { "%02X".format(it) }
    } catch (e: Throwable) {
        "n/a (${e.message})"
    }

    private fun formatAuthError(e: Throwable): String {"""
SPECIFIC["AuthManager.kt"] = [
    (re.compile(r"    private fun formatAuthError\(e: Throwable\): String \{"), lambda m: APK_SHA1_FN),
    (re.compile(r'_lastAuthDiagnostic\.value = "Stage 1 \(CredentialManager\): NoCredentialException - \$msgStr"'),
     lambda m: '_lastAuthDiagnostic.value = "Stage 1 (CredentialManager): NoCredentialException - $msgStr | App SHA-1: ${apkSha1()} | Package: ${context.packageName}"'),
]


SPECIFIC["YearsScreen.kt"].append((
    re.compile(r"(OutlinedButton\(\s*onClick = onAddYear,)"),
    lambda m: m.group(1) + "\n                        colors = androidx.compose.material3.ButtonDefaults.outlinedButtonColors(containerColor = Color(0xFFECEFF1)),"
                           "\n                        border = BorderStroke(1.dp, Color(0xFF90A4AE)),"))
SPECIFIC["MonthsScreen.kt"].append((
    re.compile(r"(colors = FilterChipDefaults\.filterChipColors\(\s*)(selectedContainerColor = EmeraldGreenContainer,)"),
    lambda m: m.group(1) + "containerColor = Color(0xFFECEFF1),\n                            " + m.group(2)))


# ---------- AddEditTransactionSheet.kt: currency tabs + IQD/USD amount sections -> orange ----------
def _sub_all(text, pairs):
    for a, b in pairs:
        text = text.replace(a, b)
    return text

def patch_transaction_sheet(text):
    try:
        t0 = text.index("// Currency Selector Tabs")
        t1 = text.index("// Dynamic Inputs based on CurrencyType")
        i0 = text.index("// Amount Field in IQD")
        u0 = text.index("// Amount Field in USD ($)")
        g0 = text.index("// Gold Weight Input")
    except ValueError:
        print("AddEditTransactionSheet: markers not found, skipped")
        return text
    tabs = _sub_all(text[t0:t1], [
        ("Color(0xFFF1F5F9)", "Color(0xFFFFF1E4)"), ("Color(0xFFCBD5E1)", "Color(0xFFFFC38A)"),
        ("Color(0xFF16A34A)", "Color(0xFFFF7A1A)"), ("Color(0xFF15803D)", "Color(0xFFE85D04)"),
        ("Color(0xFF64748B)", "Color(0xFF8A6A55)"),
        ("Color(0xFF475569)", "Color(0xFF8A6A55)"),
    ])
    iqd = text[i0:u0]
    iqd = re.sub(r"\bmainColor\b", "Color(0xFFE85D04)", iqd)
    iqd = re.sub(r"\bbgColor\b", "Color(0xFFFFF1E4)", iqd)
    iqd = re.sub(r"\bborderColor\b", "Color(0xFFFFC38A)", iqd)
    iqd = _sub_all(iqd, [("unfocusedBorderColor = Color(0xFF94A3B8)", "unfocusedBorderColor = Color(0xFFFFC38A)"),
                         ("color = Color(0xFF94A3B8)", "color = Color(0xFFB08A70)")])
    usd = text[u0:g0]
    return text[:t0] + tabs + text[t1:i0] + iqd + usd + text[g0:]

SPECIFIC["AddEditTransactionSheet.kt"] = [(re.compile(r"\A.*\Z", re.S), lambda m: patch_transaction_sheet(m.group(0)))]


# ===================== round 7 =====================
ACCOUNT_BTN = """IconButton(
                        onClick = onAccountClick,
                        modifier = Modifier.testTag("account_sync_button")
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = Icons.Default.Person,
                                contentDescription = Localization.getAccountLabel(language),
                                tint = PureWhite
                            )
                            if (isLoggedIn) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .align(Alignment.TopEnd)
                                        .background(
                                            color = when (syncStatus) {
                                                SyncStatus.SYNCED -> Color(0xFF10B981)
                                                SyncStatus.SYNCING -> Color(0xFFF59E0B)
                                                SyncStatus.ERROR -> Color(0xFFEF4444)
                                                else -> Color(0xFF9CA3AF)
                                            },
                                            shape = CircleShape
                                        )
                                        .border(1.dp, PureWhite, CircleShape)
                                )
                            }
                        }
                    }
                    """

ACCOUNT_IMPORTS = ("import androidx.compose.material.icons.filled.Person\\n"
                   "import com.example.data.sync.SyncStatus\\n"
                   "import androidx.compose.foundation.border\\n"
                   "import androidx.compose.foundation.shape.CircleShape\\n")

def account_rules():
    return [
        (re.compile(r"(import androidx\.compose\.material\.icons\.Icons\n)"),
         lambda m: m.group(1) + ACCOUNT_IMPORTS.replace("\\n", "\n")),
        (re.compile(r"(onRefreshRatesClick: \(\) -> Unit = \{\})(\s*\)\s*\{)"),
         lambda m: m.group(1) + ",\n    isLoggedIn: Boolean = false,\n    syncStatus: SyncStatus = SyncStatus.UNAUTHENTICATED,\n    onAccountClick: () -> Unit = {}" + m.group(2)),
        (re.compile(r"(actions = \{\s*)(IconButton\(\s*onClick = onShowLanguagePicker,)"),
         lambda m: m.group(1) + ACCOUNT_BTN + m.group(2)),
    ]

SPECIFIC["MonthsScreen.kt"] += account_rules()
SPECIFIC["TransactionsScreen.kt"] += account_rules()

# years: "year" word colour + title moved to the right (start) side
SPECIFIC["YearsScreen.kt"] += [
    (re.compile(r"(text = Localization\.getYearLabel\(language\),\s*)(fontSize = 12\.sp,\s*fontWeight = FontWeight\.Bold)"),
     lambda m: m.group(1) + "color = Color(0xFF263238),\n                            " + m.group(2)),
    (re.compile(r"\bCenterAlignedTopAppBar\("), lambda m: "androidx.compose.material3.TopAppBar("),
]

PROMPT_CALL = """BackHandler(enabled = currentTab != MainTab.HOME || currentScreen != AppScreen.YEARS) {
                            viewModel.handleBackNavigation()
                        }

                        val langPrefs = androidx.compose.runtime.remember {
                            applicationContext.getSharedPreferences("dahat_kharji_prefs", android.content.Context.MODE_PRIVATE)
                        }
                        val firstRunLang = androidx.compose.runtime.remember {
                            androidx.compose.runtime.mutableStateOf(
                                !langPrefs.getBoolean("language_chosen", false) && !langPrefs.contains("saved_language")
                            )
                        }
                        if (firstRunLang.value) {
                            com.example.ui.components.LanguagePickerDialog(
                                currentLanguage = language,
                                onLanguageSelected = { picked ->
                                    langPrefs.edit().putBoolean("language_chosen", true).apply()
                                    viewModel.setLanguage(picked)
                                    firstRunLang.value = false
                                },
                                onDismiss = {},
                                firstRun = true
                            )
                        }

                        val showSignInPrompt = androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(true) }
                        if (!firstRunLang.value && currentUser == null && showSignInPrompt.value &&
                            currentTab == MainTab.HOME && currentScreen == AppScreen.YEARS &&
                            activeModal is ActiveModal.None
                        ) {
                            com.example.ui.components.SignInPromptDialog(
                                language = language,
                                onClose = { showSignInPrompt.value = false },
                                onCreateAccount = {
                                    showSignInPrompt.value = false
                                    viewModel.showAccountSync()
                                }
                            )
                        }"""

def screen_call_fix(name):
    return (re.compile(r"(" + name + r"\(.*?onRefreshRatesClick = \{ viewModel\.refreshMarketRates\(\) \})(\s*\))", re.S),
            lambda m: m.group(1) + ",\n                                        isLoggedIn = currentUser != null,\n                                        syncStatus = syncStatus,\n                                        onAccountClick = { viewModel.showAccountSync() }" + m.group(2))

SPECIFIC["MainActivity.kt"] = [
    (re.compile(r"BackHandler\(enabled = [^\n]*\) \{\s*viewModel\.handleBackNavigation\(\)\s*\}"), lambda m: PROMPT_CALL),
    screen_call_fix("MonthsScreen"),
    screen_call_fix("TransactionsScreen"),
]

PROMPT_KT = """package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.AppLanguage

@Composable
fun SignInPromptDialog(
    language: AppLanguage,
    onClose: () -> Unit,
    onCreateAccount: () -> Unit
) {
    val title = when (language) {
        AppLanguage.KURDISH -> "هەژمار دروست بکە"
        AppLanguage.BADINI -> "هەژمارەکێ دروست بکە"
        AppLanguage.KURMANJI -> "Hesabekî çêke"
        AppLanguage.ARABIC -> "أنشئ حساباً"
        AppLanguage.ENGLISH -> "Create an account"
    }
    val message = when (language) {
        AppLanguage.KURDISH -> "تکایە ئەگەر دەتەوێت ئەو داهات و خەرجییانەی کە تۆماری دەکەیت یان تۆمارت کردوون هەر بمێننەوە تەنانەت دوای سڕینەوەی بەرنامەکەش یان بەردەست بن لە چەند موبایلێکی تر دا ئەوا پێویستە کە هەژمار دروست بکەیت وە هەمان هەژمار لە موبایلەکانی تریش دا بەکاربهێنیت."
        AppLanguage.BADINI -> "ژ کەرەما خۆ ئەگەر تو دخوازی ئەو داهات و خەرجییێن تو تۆمار دکەی یان تە تۆمارکرین هەر بمینن تەنانەت پشتی ژێبرنا بەرنامەی ژی، یان ل چەند مۆبایلێن دی دا بەردەست بن، ئەڤجا پێدڤییە تو هەژمارەکێ دروست بکەی و هەمان هەژمار ل مۆبایلێن دی ژی بکاربینی."
        AppLanguage.KURMANJI -> "Ji kerema xwe heke tu dixwazî ew dahat û xercên ku tu tomar dikî an te tomar kirine her bimînin, heta piştî jêbirina bernameyê jî, an li ser çend mobîlên din bên bikaranîn, gerek tu hesabekî çêkî û heman hesabî li ser mobîlên din jî bikar bînî."
        AppLanguage.ARABIC -> "إذا كنت تريد أن تبقى الدخول والمصروفات التي تسجلها أو سجلتها محفوظة حتى بعد حذف التطبيق، أو أن تكون متاحة على عدة هواتف أخرى، فيجب عليك إنشاء حساب واستخدام نفس الحساب على الهواتف الأخرى."
        AppLanguage.ENGLISH -> "If you want the income and expenses you record (or have already recorded) to stay saved even after deleting the app, or to be available on other phones, please create an account and use the same account on your other phones."
    }
    val buttonText = when (language) {
        AppLanguage.KURDISH -> "چوونەژوورەوە / دروستکردنی هەژمار"
        AppLanguage.BADINI -> "چوونە ژۆر / دروستکرنا هەژمارێ"
        AppLanguage.KURMANJI -> "Têketin / Çêkirina hesabê"
        AppLanguage.ARABIC -> "تسجيل الدخول / إنشاء حساب"
        AppLanguage.ENGLISH -> "Sign in / Create account"
    }

    Dialog(onDismissRequest = onClose) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = Color.White,
            border = BorderStroke(1.5.dp, Color(0xFFFFC38A))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = if (!language.isRtl) Arrangement.End else Arrangement.Start
                ) {
                    IconButton(onClick = onClose, modifier = Modifier.size(36.dp)) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = Color(0xFF8A6A55)
                        )
                    }
                }
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(58.dp)
                            .background(Color(0xFFFFEBD6), CircleShape)
                            .border(1.5.dp, Color(0xFFFFC38A), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = null,
                            tint = Color(0xFFE85D04),
                            modifier = Modifier.size(32.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = title,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFFB84A04),
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = message,
                        fontSize = 14.sp,
                        lineHeight = 23.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF3B2314),
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(18.dp))
                    Button(
                        onClick = onCreateAccount,
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF6A00)),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                    ) {
                        Text(
                            text = buttonText,
                            color = Color.White,
                            fontWeight = FontWeight.Black,
                            fontSize = 15.sp
                        )
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                }
            }
        }
    }
}
"""

def install_prompt():
    write(os.path.join(ROOT, "main", "java", "com", "example", "ui", "components", "SignInPromptDialog.kt"), PROMPT_KT)
    print("wrote SignInPromptDialog.kt")

# text fix + language dialog colours (applied to every .kt file)
LANG_MAP = {"DCFCE7": "FFEBD6", "16A34A": "FF7A1A", "15803D": "E85D04", "064E1A": "B84A04", "F8FAFC": "FFF6EC",
            "E2E8F0": "FFD9B8", "CBD5E1": "FFC38A", "0F172A": "3B2314", "1E293B": "5C4030", "334155": "5C4030",
            "475569": "8A6A55", "64748B": "8A6A55", "94A3B8": "B08A70", "4ADE80": "FF9A3C", "86EFAC": "FFC38A",
            "A7F3D0": "FFC38A", "ECFDF5": "FFEBD6", "F0FDF4": "FFF6EC", "059669": "E85D04", "008C45": "E85D04",
            "166534": "9A3E03", "10B981": "FF9A3C", "065F46": "B84A04", "F1F5F9": "FFEBD6"}
DELETE_MSG = re.compile(r"(پەیوەندیدارەکانی\s+)لە\s+هەور(\s+بە\s+یەکجاری)")

def apply_global(text):
    text = DELETE_MSG.sub(lambda m: m.group(1) + "ناوی" + m.group(2), text)
    start = text.find("fun LanguagePickerDialog(")
    if start != -1:
        nxt = re.search(r"\n(?=@Composable|@OptIn|private fun |internal fun |fun )", text[start + 10:])
        end = start + 10 + nxt.start() if nxt else len(text)
        text = text[:start] + recolor(text[start:end], LANG_MAP) + text[end:]
    return text

# Sorani string -> (Badini Arabic script, Kurmanji Latin)
TR = {
"داهات و خەرجی": ("داهات و خەرجی", "Dahat û Xerc"),
"ساڵ": ("ساڵ", "Sal"),
"زیادکردنی بڕی مووچە یان بڕی پارەی پەیداکراو": ("زێدەکرنا بڕا موچە یان پارەیێ هاتییە قەنجکرن", "Zêdekirina mîqdara mûçe an pereyê hatî qezenckirin"),
"زیادکردنی خەرجی": ("زێدەکرنا خەرجی", "Zêdekirina xercê"),
"بڕی پارەی ماوە": ("بڕا پارەیێ ماین", "Mîqdara pereyê mayî"),
"بڕی قەرز": ("بڕا قەرزی", "Mîqdara deynê"),
"هیچ بڕە پارەیەک نەماوە و هیچ قەرزێکیش نیە": ("چ بڕە پارە نەمایە و چ قەرزیش نینە", "Tu pere nemaye û tu deyn jî tune ye"),
"مانگ": ("مەه", "Meh"),
"د.ع": ("د.ع", "IQD"),
"کۆی داهات": ("کۆیێ داهاتی", "Giştiya dahatê"),
"کۆی خەرجی": ("کۆیێ خەرجی", "Giştiya xercê"),
"پوختەی دارایی": ("کورتیا دارایی", "Kurteya darayî"),
"ساڵە تۆمارکراوەکان": ("ساڵێن تۆمارکری", "Salên tomarkirî"),
"مانگەکانی ساڵی $year": ("مەهێن ساڵا $year", "Mehên sala $year"),
"مامەڵەکانی $monthName $year": ("تۆمارێن $monthName $year", "Tomarên $monthName $year"),
"هیچ تۆمارێک بۆ ئەم مانگە نییە. تکایە بە دوگمەکانی سەرەوە داهات یان خەرجی زیاد بکە.": ("بۆ ڤێ مەهێ چ تۆمار نینن. ژ کەرەما خۆ ب دوگمەیێن سەرێ داهات یان خەرج زێدە بکە.", "Ji bo vê mehê tu tomar tune ye. Ji kerema xwe bi bişkokên jorîn dahat an xerc zêde bike."),
"ناوی بابەت (بۆ نموونە: مووچەی مانگانە، بازاڕکردن)": ("ناڤێ تشتی (بۆ نموونە: موچەیا مەهانە، کڕین)", "Navê tiştê (mînak: mûçeya mehane, kirîn)"),
"بڕی پارە بە دیناری عێراقی (IQD)": ("بڕا پارەی ب دیناری عێراقی (IQD)", "Mîqdara pereyan bi dînarê Iraqî (IQD)"),
"پاشەکەوتکردن": ("تۆمارکرن", "Tomar bike"),
"پاشگەزبوونەوە": ("بەتالکرن", "Betal bike"),
"سڕینەوە": ("ژێبرن", "Jêbirin"),
"ئایا دڵنیایت لە سڕینەوە؟": ("تو پشتڕاستی دخوازی ژێ ببەی؟", "Tu piştrast î ku tu dixwazî jê bibî?"),
"ئەم بڕە پارەیە دەسڕدرێتەوە و کاریگەری لەسەر پوختەکە دروست دەکات.": ("ئەڤ بڕە پارە دێ هێتە ژێبرن و کاریگەریێ ل سەر کورتیێ دکەت.", "Ev mîqdar dê bê jêbirin û bandorê li ser kurteyê bike."),
"سڕینەوەی ساڵی $year": ("ژێبرنا ساڵا $year", "Jêbirina sala $year"),
"ئایا دڵنیایت لە سڕینەوەی ساڵی $year؟ هەموو تۆمار و زانیارییەکانی ئەم ساڵە بە تەواوی دەسڕدرێنەوە.": ("تو پشتڕاستی دخوازی ساڵا $year ژێ ببەی؟ هەمی تۆمار و زانیارییێن ڤێ ساڵێ ب تەمامی دێ هێنە ژێبرن.", "Tu piştrast î ku tu dixwazî sala $year jê bibî? Hemû tomar û agahiyên vê salê bi temamî dê bên jêbirin."),
"هەڵبژاردنی زمان": ("هەڵبژارتنا زمانی", "Hilbijartina zimên"),
"تێپەڕاندن": ("دەربازبوون", "Derbas bike"),
"دووبارەکردنەوەی ئەنیمەیشن": ("دووبارەکرنا ئەنیمەیشنێ", "Animasyonê dubare bike"),
"پیشاندانی هەموو ١٢ مانگەکە": ("نیشاندانا هەمی ١٢ مەهان", "Hemû 12 mehan nîşan bide"),
"پیشاندان تا مانگی ئێستا": ("نیشاندان هەتا مەها نوکە", "Heta mehê niha nîşan bide"),
"جۆری پۆلێن": ("جۆرێ پۆلێنی", "Kategorî"),
"تێبینی (ئارەزوومەندانە)": ("تێبینی (ب دڵخوازی)", "Têbînî (bi dilxwazî)"),
"ڕۆژ": ("ڕۆژ", "Roj"),
"ساڵی $year بە شێوەی خۆکار لەگەڵ کاتژمێری ئامێرەکە هاوکات کراوە": ("ساڵا $year ب شێوەیەکێ ئۆتۆماتیکی دگەل دەمژمێرا ئامێری هەڤدەم بوویە", "Sala $year bi awayekî otomatîk bi saeta cîhazê re hevdem bûye"),
"نرخی دۆلار": ("نرخێ دۆلاری", "Nirxê dolarê"),
"نرخی زێڕ": ("نرخێ زێڕی", "Nirxê zêr"),
"عەیاری زێڕ": ("عەیارا زێڕی", "Ayara zêr"),
"نوێکردنەوەی نرخەکان": ("نویکرنا نرخان", "Nirxan nû bike"),
"نرخ بەردەست نییە": ("نرخ نینە", "Nirx tune ye"),
"دوا نوێکردنەوە": ("نویکرنا دوماهیێ", "Nûvekirina dawî"),
"ڕێکخستنی عەیار و کێشی زێڕ": ("ڕێکخستنا عەیار و کێشا زێڕی", "Mîhengên ayar û giraniya zêr"),
"یەکەی کێش": ("یەکەیا کێشێ", "Yekeya giraniyê"),
"دۆلاری ئەمریکی ($)": ("دۆلارێ ئەمریکی ($)", "Dolarê Amerîkî ($)"),
"دیناری عێراقی (IQD)": ("دیناری عێراقی (IQD)", "Dînarê Iraqî (IQD)"),
"زێڕ": ("زێڕ", "Zêr"),
"نرخی دۆلار دانراوە بەپێی $cityName": ("نرخێ دۆلاری ل گور $cityName هاتییە دانان", "Nirxê dolarê li gorî $cityName hatiye danîn"),
"گۆڕینی شوێن": ("گوهۆڕینا جهی", "Guherandina cihê"),
"هەڵبژاردنی شار بۆ نرخی دۆلار": ("هەڵبژارتنا باژێری بۆ نرخێ دۆلاری", "Bajarek ji bo nirxê dolarê hilbijêre"),
"عەیار": ("عەیار", "Ayar"),
"مسقاڵ": ("مسقال", "Mîsqal"),
"گرام": ("گرام", "Gram"),
"کێشی زێڕ": ("کێشا زێڕی", "Giraniya zêr"),
"بڕی هاوتا بە دینار": ("بڕا هەڤتا ب دینار", "Mîqdara hevwate bi dînar"),
"یەکەی پێوانە": ("یەکەیا پێڤانێ", "Yekeya pîvanê"),
"نرخی زیندووی بازاڕ": ("نرخێ زیندی یێ بازارێ", "Nirxê zindî yê bazarê"),
"نرخی فەرمی لەبەردەست نییە بۆ هەڵەبجە": ("بۆ هەلەبجێ نرخێ فەرمی نینە", "Ji bo Helebceyê nirxê fermî tune ye"),
"نرخ لەبەردەست نییە": ("نرخ نینە", "Nirx tune ye"),
"داتای پێشوو (ئۆفلاین)": ("داتایێن بەری (ئۆفلاین)", "Daneyên berê (Offline)"),
"نوێکردنەوە": ("نویکرن", "Nû bike"),
"نوێدەکرێتەوە...": ("دهێتە نویکرن...", "Tê nûkirin..."),
"دوا نوێکردنەوە: $timestamp": ("نویکرنا دوماهیێ: $timestamp", "Nûvekirina dawî: $timestamp"),
"کڕین: $buy | فرۆشتن: $sell": ("کڕین: $buy | فرۆتن: $sell", "Kirîn: $buy | Firotin: $sell"),
"نرخی دۆلار لەبەردەست نییە بۆ ئەم شارە. تکایە شارێکی تر هەڵبژێرە.": ("نرخێ دۆلاری بۆ ڤی باژێری نینە. ژ کەرەما خۆ باژێرەکێ دی هەڵبژێرە.", "Ji bo vî bajarî nirxê dolarê tune ye. Ji kerema xwe bajarekî din hilbijêre."),
"نرخی زێڕ لەبەردەست نییە. تکایە دواتر هەوڵ بدەرەوە.": ("نرخێ زێڕی نوکە نینە. ژ کەرەما خۆ پاشی جارەکا دی هەوڵ بدە.", "Nirxê zêr niha tune ye. Ji kerema xwe paşê dîsa biceribîne."),
"سەرەکی": ("سەرەکی", "Serekî"),
"ئاڵوگۆڕ": ("بازار", "Bazar"),
"ژمێرەری": ("ژمێرەر", "Hesabker"),
"بۆردی بازاڕە داراییەکان": ("تەختێ بازارێن دارایی", "Panela bazarên darayî"),
"ئاڵوگۆڕی دراوەکان (USD / IQD)": ("ئاڵوگۆڕا دراڤان (USD / IQD)", "Danûstandina diravan (USD / IQD)"),
"نرخی زێڕ (بە پێی عەیار)": ("نرخێ زێڕی (ل گور عەیاری)", "Nirxê zêr (li gorî ayarê)"),
"نرخی زیو (Silver)": ("نرخێ زیڤی (Silver)", "Nirxê zîv (Silver)"),
"ژمێرەری ئاڵوگۆڕی دراو": ("ژمێرەرا ئاڵوگۆڕا دراڤان", "Hesabkera danûstandina diravan"),
"بڕی پارە": ("بڕا پارەی", "Mîqdar"),
"لە": ("ژ", "Ji"),
"بۆ": ("بۆ", "Bo"),
"گۆڕینەوە": ("بگوهۆڕە", "Biguhere"),
"زیو": ("زیڤ", "Zîv"),
"کێش بنووسە بۆ هەژمارکردنی ڕاستەوخۆ": ("کێشێ بنڤیسە بۆ هەژمارکرنا ڕاستەوخۆ", "Giraniyê binivîse ji bo hesabkirina rasterast"),
"کۆی بەها:": ("کۆیێ بەهای:", "Nirxa giştî:"),
"١ مسقاڵ = ٥ گرام لە بازاڕی عێراق": ("١ مسقال = ٥ گرام ل بازارێ عێراقێ", "1 mîsqal = 5 gram li bazara Iraqê"),
"سەرچاوە: dinarchi.com": ("ژێدەر: dinarchi.com", "Çavkanî: dinarchi.com"),
"ڕاستەوخۆ لە بۆرد": ("ڕاستەوخۆ ژ تەختێ", "Rasterast ji tabloyê"),
"کاشی ئۆفلاین": ("کاشێ ئۆفلاین", "Kaşa offline"),
"ژمێرەری دارایی": ("ژمێرەرا دارایی", "Hesabkera darayî"),
"کۆپیکردنی ئەنجام": ("کۆپیکرنا ئەنجامی", "Encamê kopî bike"),
"ئەنجام کۆپی کرا": ("ئەنجام هاتە کۆپیکرن", "Encam hate kopîkirin"),
"نرخی ١ گرام بە دینار": ("نرخێ ١ گرامی ب دینار", "Nirxê 1 gramê bi dînar"),
"نرخی ١ ئۆنسە بە دۆلار": ("نرخێ ١ ئۆنسێ ب دۆلار", "Nirxê 1 ûnsê bi dolar"),
"بەراوردی نرخی شارەکانی عێراق": ("بەراوردکرنا نرخێن باژێرێن عێراقێ", "Berawirdkirina nirxên bajarên Iraqê"),
"کاتی نوێکردنەوەی دینارچی: $timestamp": ("دەمێ نویکرنا دینارچی: $timestamp", "Dema nûvekirina dinarchi: $timestamp"),
"کاتی دوایین وەرگرتن: $timestamp": ("دەمێ وەرگرتنا دوماهیێ: $timestamp", "Dema wergirtina dawî: $timestamp"),
"هەژمار": ("هەژمار", "Hesab"),
"چوونەژوورەوە لە ڕێگەی گووگڵ (Google)": ("چوونە ژۆر ب ڕێکا گووگڵ (Google)", "Têketin bi Google"),
"چوونەژوورەوە بە ئیمەیڵ": ("چوونە ژۆر ب ئیمەیل", "Têketin bi e-nameyê"),
"دروستکردنی هەژماری نوێ": ("دروستکرنا هەژمارا نوی", "Çêkirina hesabekî nû"),
"ئیمەیڵ": ("ئیمەیل", "E-name"),
"وشەی تێپەڕ": ("پەیڤا نهێنی", "Peyva nepenî"),
"دووبارەکردنەوەی وشەی تێپەڕ": ("دووبارەکرنا پەیڤا نهێنی", "Peyva nepenî dubare bike"),
"وشەی تێپەڕت لەبیرچووە؟": ("تە پەیڤا نهێنی ژ بیر کریە؟", "Te peyva nepenî ji bîr kiriye?"),
"ناردنی لینکی گۆڕینی وشەی تێپەڕ": ("هنارتنا لینکا گوهۆڕینا پەیڤا نهێنی", "Girêdana guhertina peyva nepenî bişîne"),
"لینکی ڕێکخستنەوەی وشەی تێپەڕ بۆ ئیمەیڵەکەت نێردرا": ("لینکا نویکرنا پەیڤا نهێنی بۆ ئیمەیلا تە هاتە هنارتن", "Girêdana nûkirina peyva nepenî ji e-nameya te re hat şandin"),
"چوونەدەرەوە لە هەژمار": ("دەرکەفتن ژ هەژمارێ", "Ji hesabê derkeve"),
"سڕینەوەی هەژمار و زانیاریەکان": ("ژێبرنا هەژمار و زانیاریان", "Jêbirina hesab û agahiyan"),
"دڵنیایت لە سڕینەوەی هەژمار؟": ("تو پشتڕاستی دخوازی هەژماری ژێ ببەی؟", "Tu piştrast î ku tu dixwazî hesabê jê bibî?"),
"سڕینەوەی ئەم هەژمارە و زانیارییە پەیوەندیدارەکانی لە هەور بە یەکجاری و هەمیشەیی دەسڕدرێنەوە و ناگەڕێنرێنەوە.": ("ژێبرنا ڤێ هەژمارێ و زانیارییێن پەیوەندیدار ب وێ ڤە ب تەمامی و بۆ هەمیشەیی دێ هێنە ژێبرن و ناهێنە زڤراندن.", "Ev hesab û agahiyên girêdayî wê bi temamî û her û her dê bên jêbirin û nayên vegerandin."),
"هاوکاتکردنی ڕاستەوخۆ ئێستا": ("نوکە هەڤدەم بکە", "Niha hevdem bike"),
"داگرتنی داتای دارایی (Backup)": ("دابەزاندنا داتایێن دارایی (Backup)", "Daneyên darayî daxe (Backup)"),
"داتاکان لە کلیپبۆرد کۆپی کران و باکئەپەکەت ئامادەیە": ("داتا ل کلیپبۆردی هاتنە کۆپیکرن و باکئەپا تە ئامادەیە", "Dane li clipboardê hatin kopîkirin û backupa te amade ye"),
"هاوکات کراوە لەگەڵ هەور": ("دگەل هەورێ هەڤدەم بوویە", "Bi ewrê re hevdem bûye"),
"خەریکی هاوکاتکردنە...": ("خەریکێ هەڤدەمکرنێیە...", "Hevdemkirin didome..."),
"ئۆفلاین (پاشەکەوتکراوی لۆکاڵی)": ("ئۆفلاین (ل سەر ئامێری هاتییە پاراستن)", "Offline (li ser cîhazê hatiye tomarkirin)"),
"هەڵە لە هاوکاتکردن": ("ئاریشە د هەڤدەمکرنێ دا", "Çewtî di hevdemkirinê de"),
"چوونەژوورەوە پێویستە بۆ باکئەپی هەور": ("بۆ باکئەپا هەورێ چوونە ژۆر پێدڤییە", "Ji bo backupa ewrê têketin pêwîst e"),
"$count تۆماری دارایی لۆکاڵیت هەیە. ئایا دەتەوێت لەسەر هەژماری هەورەکەت باکئەپ بکرێن؟": ("$count تۆمارێن تە یێن دارایی ل سەر ئامێری هەنە. تو دخوازی ل سەر هەژمارا هەورا خۆ باکئەپ بکەی؟", "$count tomarên te yên darayî li ser cîhazê hene. Tu dixwazî wan li ser hesabê xwe yê ewrê backup bikî?"),
"بەڵێ، باکئەپ بکە": ("بەلێ، باکئەپ بکە", "Erê, backup bike"),
"دواتر": ("پاشی", "Paşê"),
"تێبینی: داتاکان لە کاتی نەبوونی هێڵ بە شێوەی لۆکاڵی دەپارێزرێن و لەگەڵ بەردەستبوونی ئینتەرنێت هاوکات دەکرێن.": ("تێبینی: د دەمێ نەبوونا ئینتەرنێتێ دا داتا ل سەر ئامێری دهێنە پاراستن و دەمێ ئینتەرنێت هەبیت دگەل هەڤدەم دبن.", "Têbînî: Dema înternet tune be dane li ser cîhazê tên tomarkirin û gava înternet hebe bi xwe re hevdem dibin."),
"تکایە ئیمەیڵ بنووسە": ("ژ کەرەما خۆ ئیمەیلێ بنڤیسە", "Ji kerema xwe e-nameyê binivîse"),
"تکایە ناونیشانی ئیمەیڵێکی دروست بنووسە": ("ژ کەرەما خۆ ناڤنیشانەکا ئیمەیلێ یا دروست بنڤیسە", "Ji kerema xwe navnîşana e-nameyeke derbasdar binivîse"),
"تکایە وشەی تێپەڕ بنووسە": ("ژ کەرەما خۆ پەیڤا نهێنی بنڤیسە", "Ji kerema xwe peyva nepenî binivîse"),
"وشەی تێپەڕ دەبێت لانی کەم ٦ پیت یان ژمارە بێت": ("پەیڤا نهێنی دڤێت لانی کەم ٦ پیت یان ژمارە بیت", "Peyva nepenî divê herî kêm 6 tîp an jimar be"),
"وشەی تێپەڕ و دووبارەکردنەوەی وەک یەک نین": ("پەیڤا نهێنی و دووبارەکرنا وێ وەک ئێک نینن", "Peyva nepenî û dubarekirina wê wekhev nînin"),
"هێشتا هەژمارت نییە؟ دروستکردنی هەژمار": ("هێشتا هەژمارا تە نینە؟ هەژمارەکێ دروست بکە", "Hê hesabê te tune ye? Hesabekî çêke"),
"پێشتر هەژمارت دروستکردووە؟ چوونەژوورەوە": ("بەری نوکە تە هەژمار دروست کرییە؟ بچۆ ژۆر", "Berê te hesab çêkiriye? Têkeve"),
"ئەم ئیمەیڵە پێشتر تۆمارکراوە. تکایە بچۆ ژوورەوە یان ئیمەیڵێکی تر بەکاربهێنە.": ("ئەڤ ئیمەیلە بەری نوکە هاتییە تۆمارکرن. ژ کەرەما خۆ بچۆ ژۆر یان ئیمەیلەکا دی بکاربینە.", "Ev e-name berê hatiye tomarkirin. Ji kerema xwe têkeve an e-nameyeke din bikar bîne."),
"هیچ هەژمارێک بەم ئیمەیڵە نەدۆزرایەوە. تکایە سەرەتا هەژمار دروست بکە.": ("ب ڤی ئیمەیلی چ هەژمار نەهاتە دیتن. ژ کەرەما خۆ ب دەستپێکێ هەژمارەکێ دروست بکە.", "Bi vê e-nameyê re tu hesab nehat dîtin. Ji kerema xwe pêşî hesabekî çêke."),
"ئیمەیڵ یان وشەی تێپەڕ هەڵەیە. تکایە دووبارە دڵنیابەرەوە.": ("ئیمەیل یان پەیڤا نهێنی خەلەتە. ژ کەرەما خۆ جارەکا دی پشتڕاست بکە.", "E-name an peyva nepenî çewt e. Ji kerema xwe dîsa kontrol bike."),
"وشەی تێپەڕ زۆر لاوازە. دەبێت لانی کەم ٦ پیت بێت.": ("پەیڤا نهێنی گەلەک لاوازە. دڤێت لانی کەم ٦ پیت بیت.", "Peyva nepenî pir lawaz e. Divê herî kêm 6 tîp be."),
"کێشەی پەیوەندی بە هێڵی ئینتەرنێت هەیە. تکایە هێڵەکەت بپشکنە.": ("ئاریشەیا پەیوەندیا ئینتەرنێتێ هەیە. ژ کەرەما خۆ هێلا خۆ بپشکنە.", "Pirsgirêka girêdana înternetê heye. Ji kerema xwe girêdana xwe kontrol bike."),
"داواکاری زۆر نێردراوە. تکایە کەمێکی تر دووبارە هەوڵبدەرەوە.": ("گەلەک داخوازی هاتینە هنارتن. ژ کەرەما خۆ پشتی دەمەکی جارەکا دی هەوڵ بدە.", "Gelek daxwaz hatine şandin. Ji kerema xwe piştî demekê dîsa biceribîne."),
"کێشە لە پەیوەندی گووگڵ هەیە. تکایە دڵنیابەرەوە لە کارابوونی Google لە کۆنسۆڵی Firebase و تۆمارکردنی کلیلەکان.": ("ئاریشەیەک د پەیوەندیا گووگڵ دا هەیە. ژ کەرەما خۆ پشتڕاست بە کو Google د Firebase Console دا چالاکە و کلیلەکان هاتینە تۆمارکرن.", "Pirsgirêkek di girêdana Google de heye. Ji kerema xwe piştrast be ku Google di Firebase Console de çalak e û mifteyên SHA hatine tomarkirin."),
"پڕۆسەی چوونەژوورەوە لە ڕێگەی گووگڵ تەواو نەکرا یان هەڵوەشێنرایەوە.": ("پڕۆسەیا چوونە ژۆرێ ب گووگڵ تەمام نەبوو یان هاتە بەتالکرن.", "Pêvajoya têketinê bi Google neqediya an hat betalkirin."),
"نەتوانرا پەیوەندی بە هەژماری گووگڵەوە بکرێت. تکایە دڵنیابەرەوە لە هەژماری گووگڵ لەسەر ئامێرەکە و دووبارە هەوڵبدەرەوە.": ("پەیوەندی ب هەژمارا گووگڵ ڤە نەهاتە کرن. ژ کەرەما خۆ هەژمارا گووگڵ ل سەر ئامێری بپشکنە و جارەکا دی هەوڵ بدە.", "Girêdana bi hesabê Google re pêk nehat. Ji kerema xwe hesabê Google yê li ser cîhazê kontrol bike û dîsa biceribîne."),
"نەتوانرا ناسنامەی گووگڵ (ID Token) وەربگیرێت. تکایە دووبارە هەوڵبدەرەوە.": ("ناسنامەیا گووگڵ (ID Token) نەهاتە وەرگرتن. ژ کەرەما خۆ جارەکا دی هەوڵ بدە.", "Nasnameya Google (ID Token) nehat wergirtin. Ji kerema xwe dîsa biceribîne."),
# ---- other files ----
"ساڵی ئێستا": ("ساڵا نوکە", "Sala niha"),
"تۆمار": ("تۆمار", "tomar"),
"مانگی چالاک لەسەر مۆبایل": ("مەها چالاک ل سەر مۆبایلێ", "Meha çalak li ser mobîlê"),
"هاوسەنگی دارایی تەواوە (٠)": ("هەڤسەنگیا دارایی تەمامە (٠)", "Hevsengiya darayî temam e (0)"),
"بەڕێوەبردنی داهات و خەرجییەکانت بە دیناری عێراقی": ("بڕێڤەبرنا داهات و خەرجییێن تە ب دیناری عێراقی", "Rêvebirina dahat û xercên te bi dînarê Iraqî"),
"ساڵێک دیاری بکە (بۆ نموونە: 2026، 2027):": ("ساڵەکێ دیار بکە (بۆ نموونە: 2026، 2027):", "Salekê diyar bike (mînak: 2026, 2027):"),
"خەریکی پەیوەستکردنی هەژمارە...": ("خەریکێ پەیوەستکرنا هەژمارێیە...", "Hesab tê girêdan..."),
"یان بە ئیمەیڵ": ("یان ب ئیمەیل", "an bi e-nameyê"),
"مووچە": ("موچە", "Mûçe"),
"خۆراک": ("خوارن", "Xwarin"),
"بۆ نموونە: مووچەی مانگانە، فرۆشتنی زێڕ": ("بۆ نموونە: موچەیا مەهانە، فرۆتنا زێڕی", "Mînak: mûçeya mehane, firotina zêr"),
"بۆ نموونە: کرێی خانوو، کڕینی زێڕ": ("بۆ نموونە: کرێیا خانی، کڕینا زێڕی", "Mînak: kirêya xanî, kirîna zêr"),
"مسقاڵ": ("مسقال", "Mîsqal"),
"عەیار $karatNumber": ("عەیار $karatNumber", "Ayar $karatNumber"),
"هەولێر": ("هەولێر", "Hewlêr"),
"سلێمانی": ("سلێمانی", "Silêmanî"),
"دهۆک": ("دهۆک", "Duhok"),
"بەغدا": ("بەغدا", "Bexda"),
}

# category lists (Sorani list literal -> (badini list, latin list))
LISTS = {
 'listOf("مووچە", "پڕۆژە", "فرۆشتن", "زێڕ و سەرمایە", "بەخشین/پاداشت", "وەبەرهێنان", "هی تر")':
   ('listOf("موچە", "پڕۆژە", "فرۆتن", "زێڕ و سەرمایە", "بەخشین/پاداش", "وەبەرهێنان", "یێن دی")',
    'listOf("Mûçe", "Proje", "Firotin", "Zêr û sermaye", "Bexşîn/Xelat", "Veberhênan", "Yên din")'),
 'listOf("خۆراک", "خانوو", "زێڕ و پاشەکەوت", "هاتوچۆ", "پێداویستی", "تەندروستی", "بازاڕکردن", "هی تر")':
   ('listOf("خوارن", "خانی", "زێڕ و پاشەکەفت", "هاتوچوون", "پێدڤی", "تەندروستی", "کڕین", "یێن دی")',
    'listOf("Xwarin", "Xanî", "Zêr û hilanîn", "Veguhastin", "Pêdivî", "Tenduristî", "Kirîn", "Yên din")'),
}

MONTHS_BA = ["کانوونا دووێ", "شوبات", "ئادار", "نیسان", "ئایار", "حەزیران", "تەباخ", "ئاب", "ئەیلوول", "تشرینا پێشین", "تشرینا دووێ", "کانوونا پێشین"]
MONTHS_LA = ["Kanûna Duyê", "Şubat", "Adar", "Nîsan", "Ayar", "Hezîran", "Tebax", "Ab", "Eylûl", "Teşrîna Pêşîn", "Teşrîna Duyê", "Kanûna Pêşîn"]

# toasts (login / register) in FinanceViewModel
LOGIN_BA = "ب سەرکەفتیانە چووە ژۆر ("
LOGIN_LA = "Bi serkeftî têketin ("
REG_BA = "هەژمار ب سەرکەفتیانە هاتە دروستکرن ("
REG_LA = "Hesab bi serkeftî hat çêkirin ("

# ===================== Badini (Arabic script) + Kurmanji (Latin) =====================
NEW_ENUM = '''enum class AppLanguage(val code: String, val displayName: String, val isRtl: Boolean) {
    KURDISH("ku", "کوردی سۆرانی", true),
    BADINI("ku-bdn", "کوردی بادینی (کوورمانجی سەروو)", true),
    KURMANJI("ku-latn", "Kurdîya Behdînî (Kurmancîya Jorîn)", false),
    ENGLISH("en", "English", false),
    ARABIC("ar", "العربية", true)
}'''

_KU_LINE = re.compile(r'^(?P<ind>[ \t]*)AppLanguage\.KURDISH -> "(?P<s>[^\n]*)"[ \t]*$', re.M)
_KU_LIST = re.compile(r'^(?P<ind>[ \t]*)AppLanguage\.KURDISH -> (?P<l>listOf\([^\n]*\))[ \t]*$', re.M)

def _line_langs(m):
    s = m.group("s")
    if s not in TR:
        print("WARNING: no Badini/Kurmanji translation for:", s)
        ba, la = s, s
    else:
        ba, la = TR[s]
    ind = m.group("ind")
    return (m.group(0) + "\n" + ind + 'AppLanguage.BADINI -> "' + ba + '"\n' + ind + 'AppLanguage.KURMANJI -> "' + la + '"')

def _list_langs(m):
    l = m.group("l")
    if l not in LISTS:
        print("WARNING: no list translation for:", l)
        return m.group(0)
    ba, la = LISTS[l]
    ind = m.group("ind")
    return m.group(0) + "\n" + ind + "AppLanguage.BADINI -> " + ba + "\n" + ind + "AppLanguage.KURMANJI -> " + la

def _months_block(text):
    ba = "\n".join('                %d -> "مەها %s (%s)"' % (i + 1, "".join("٠١٢٣٤٥٦٧٨٩"[int(c)] for c in str(i + 1)), MONTHS_BA[i]) for i in range(12))
    la = "\n".join('                %d -> "Meha %d (%s)"' % (i + 1, i + 1, MONTHS_LA[i]) for i in range(12))
    block = ("            AppLanguage.BADINI -> when (monthNumber) {\n" + ba + '\n                else -> "مەها $monthNumber"\n            }\n'
             "            AppLanguage.KURMANJI -> when (monthNumber) {\n" + la + '\n                else -> "Meha $monthNumber"\n            }\n')
    marker = "            AppLanguage.ARABIC -> when (monthNumber) {"
    if marker in text and "AppLanguage.BADINI -> when (monthNumber)" not in text:
        text = text.replace(marker, block + marker, 1)
    return text

def _viewmodel_toasts(text):
    pat = re.compile(r'val msg = if \(language\.value == AppLanguage\.KURDISH\) \{\s*"(?P<ku>[^"]*)\(\$(?P<v>\w+)\)"')
    def rep(m):
        ku, v = m.group("ku"), m.group("v")
        reg = ku.startswith("هەژمار")
        ba, la = (REG_BA, REG_LA) if reg else (LOGIN_BA, LOGIN_LA)
        return ('val msg = if (language.value == AppLanguage.BADINI) {\n                    "' + ba + '$' + v + ')"\n                } '
                'else if (language.value == AppLanguage.KURMANJI) {\n                    "' + la + '$' + v + ')"\n                } '
                'else if (language.value == AppLanguage.KURDISH) {\n                    "' + ku + '($' + v + ')"')
    return pat.sub(rep, text)

def _account_lines(text):
    pat = re.compile(r'if \(language == AppLanguage\.KURDISH\) "(?P<ku>[^"]*)" else if')
    def rep(m):
        ku = m.group("ku")
        if ku not in TR:
            return m.group(0)
        ba, la = TR[ku]
        return ('if (language == AppLanguage.KURDISH) "' + ku + '" else if (language == AppLanguage.BADINI) "' + ba +
                '" else if (language == AppLanguage.KURMANJI) "' + la + '" else if')
    return pat.sub(rep, text)

def _language_picker(text):
    start = text.find("fun LanguagePickerDialog(")
    if start == -1:
        return text
    nxt = re.search(r"\n(?=@Composable|@OptIn|private fun |internal fun |fun )", text[start + 10:])
    end = start + 10 + nxt.start() if nxt else len(text)
    body = text[start:end]
    body = body.replace("    onDismiss: () -> Unit\n) {", "    onDismiss: () -> Unit,\n    firstRun: Boolean = false\n) {", 1)
    body = body.replace("onDismissRequest = onDismiss,", "onDismissRequest = { if (!firstRun) onDismiss() },", 1)
    body = body.replace("text = Localization.getLanguageSelectorTitle(currentLanguage),",
                        'text = if (firstRun) "هەڵبژاردنی زمان • Hilbijartina zimên • Choose Language" else Localization.getLanguageSelectorTitle(currentLanguage),', 1)
    body = body.replace('confirmButton = {\n            TextButton(\n                onClick = onDismiss,\n                modifier = Modifier.testTag("dismiss_language_picker")',
                        'confirmButton = {\n            if (!firstRun) TextButton(\n                onClick = onDismiss,\n                modifier = Modifier.testTag("dismiss_language_picker")', 1)
    return text[:start] + body + text[end:]

def apply_languages(name, text):
    if name == "Localization.kt":
        text = re.sub(r"enum class AppLanguage\(.*?\n\}", lambda m: NEW_ENUM, text, count=1, flags=re.S)
        text = re.sub(r'return when \(lang\) \{\s*AppLanguage\.ENGLISH -> "\$formattedNumber \$unit"\s*AppLanguage\.KURDISH, AppLanguage\.ARABIC -> "\$formattedNumber \$unit"\s*\}',
                      lambda m: 'return "$formattedNumber $unit"', text, count=1)
        text = _months_block(text)
    if "AppLanguage.KURDISH ->" in text:
        text = _KU_LINE.sub(_line_langs, text)
        text = _KU_LIST.sub(_list_langs, text)
    if name == "FinanceViewModel.kt":
        text = _viewmodel_toasts(text)
    if name == "AccountSyncDialog.kt":
        text = _account_lines(text)
    if name == "AppModals.kt":
        text = _language_picker(text)
    return text

def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf-8").write(text)

def install_icon():
    res = os.path.join(ROOT, "main", "res")
    if os.path.isdir(res):
        for d in os.listdir(res):
            if d.startswith("mipmap-anydpi"):
                for f in os.listdir(os.path.join(res, d)):
                    if f.startswith("ic_launcher") and f.endswith(".xml"):
                        os.remove(os.path.join(res, d, f))
    write(os.path.join(res, "drawable", "ic_hawrega_bg.xml"), ICON_BG)
    write(os.path.join(res, "drawable", "ic_hawrega_fg.xml"), ICON_FG)
    write(os.path.join(res, "mipmap-anydpi-v26", "ic_launcher.xml"), ICON_XML)
    write(os.path.join(res, "mipmap-anydpi-v26", "ic_launcher_round.xml"), ICON_XML)
    man = os.path.join(ROOT, "main", "AndroidManifest.xml")
    if os.path.exists(man):
        t = open(man, encoding="utf-8").read()
        for attr, val in (("icon", "@mipmap/ic_launcher"), ("roundIcon", "@mipmap/ic_launcher_round")):
            if re.search(r'android:%s="[^"]*"' % attr, t):
                t = re.sub(r'android:%s="[^"]*"' % attr, 'android:%s="%s"' % (attr, val), t)
            else:
                t = t.replace("<application", '<application\n        android:%s="%s"' % (attr, val), 1)
        open(man, "w", encoding="utf-8").write(t)
        print("patched manifest icon")

changed = 0
found_color = False
for dirpath, _, files in os.walk(ROOT):
    for name in files:
        if not name.endswith(".kt"):
            continue
        path = os.path.join(dirpath, name)
        if name == "Color.kt" and "theme" in dirpath.replace("\\", "/"):
            open(path, "w", encoding="utf-8").write(COLOR_KT)
            found_color = True
            print("rewrote", path)
            continue
        src_text = open(path, encoding="utf-8").read()
        out = apply_global(apply_languages(name, src_text))
        for rx, rep in SPECIFIC.get(name, []):
            out = rx.sub(rep, out)
        mapping = dict(COMMON)
        mapping.update(PER_FILE.get(name, {}))
        out = recolor(out, mapping)
        if out != src_text:
            open(path, "w", encoding="utf-8").write(out)
            changed += 1
            print("recolored", path)

install_icon()
install_prompt()
print("files recolored:", changed)
if not found_color:
    print("ERROR: theme/Color.kt not found", file=sys.stderr)
    sys.exit(1)
