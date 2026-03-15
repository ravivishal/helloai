#!/usr/bin/env python3
"""hello.ai - Investor Deck PDF Generator using ReportLab"""

import os
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.units import mm, inch
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hello_ai_Investor_Deck.pdf")
W, H = landscape(A4)

# Colors
BLUE = HexColor("#2563EB")
DARK_BLUE = HexColor("#1D4ED8")
LIGHT_BLUE = HexColor("#DBEAFE")
PALE_BLUE = HexColor("#EFF6FF")
DARK_BG = HexColor("#0F172A")
DARK_CARD = HexColor("#1E293B")
GRAY = HexColor("#6B7280")
LIGHT_GRAY = HexColor("#F3F4F6")
GREEN = HexColor("#16A34A")
RED = HexColor("#DC2626")
AMBER = HexColor("#F59E0B")
TEXT_BLACK = HexColor("#111827")
SLATE = HexColor("#94A3B8")
LIGHT_SLATE = HexColor("#CBD5E1")

slide_num = 0

def draw_rounded_rect(c, x, y, w, h, r, fill_color=None, stroke=False):
    c.saveState()
    if fill_color:
        c.setFillColor(fill_color)
    if stroke:
        c.setStrokeColor(fill_color or black)
    p = c.beginPath()
    p.roundRect(x, y, w, h, r)
    if fill_color and not stroke:
        c.drawPath(p, fill=1, stroke=0)
    elif stroke:
        c.drawPath(p, fill=0, stroke=1)
    else:
        c.drawPath(p, fill=1, stroke=0)
    c.restoreState()

def draw_circle(c, cx, cy, r, fill_color):
    c.saveState()
    c.setFillColor(fill_color)
    c.circle(cx, cy, r, fill=1, stroke=0)
    c.restoreState()

def new_slide(c, bg=white):
    global slide_num
    if slide_num > 0:
        c.showPage()
    slide_num += 1
    c.saveState()
    c.setFillColor(bg)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.restoreState()

def footer(c):
    c.saveState()
    c.setFont("Helvetica", 7)
    c.setFillColor(GRAY)
    c.drawCentredString(W/2, 8*mm, f"hello.ai  |  Confidential  |  Slide {slide_num}")
    c.restoreState()

def draw_text(c, text, x, y, size=12, color=TEXT_BLACK, font="Helvetica", align="left"):
    c.saveState()
    c.setFont(font, size)
    c.setFillColor(color)
    if align == "center":
        c.drawCentredString(x, y, text)
    elif align == "right":
        c.drawRightString(x, y, text)
    else:
        c.drawString(x, y, text)
    c.restoreState()

def draw_bullet_list(c, items, x, y, size=10, color=TEXT_BLACK, spacing=14):
    cy = y
    for item in items:
        draw_text(c, "-  " + item, x, cy, size=size, color=color)
        cy -= spacing
    return cy

def draw_top_bar(c):
    c.saveState()
    c.setFillColor(BLUE)
    c.rect(0, H - 2*mm, W, 2*mm, fill=1, stroke=0)
    c.restoreState()

def heading(c, text, x, y, size=28, color=BLUE):
    draw_text(c, text, x, y, size=size, color=color, font="Helvetica-Bold")

def subheading(c, text, x, y, size=12, color=GRAY):
    draw_text(c, text, x, y, size=size, color=color)

# ======================================================================
# BUILD THE DECK
# ======================================================================
def build():
    c = canvas.Canvas(OUTPUT, pagesize=landscape(A4))
    c.setTitle("hello.ai - Investor Presentation")
    c.setAuthor("hello.ai")

    # ==================================================================
    # SLIDE 1: COVER
    # ==================================================================
    new_slide(c, bg=DARK_BG)

    # Decorative circles
    draw_circle(c, 60*mm, H - 30*mm, 60*mm, HexColor("#1E3A8A"))
    draw_circle(c, W - 40*mm, 30*mm, 45*mm, HexColor("#1E3A8A"))

    # Logo circle
    draw_circle(c, W/2, H - 55*mm, 14*mm, BLUE)
    draw_text(c, "MC", W/2, H - 59*mm, size=16, color=white, font="Helvetica-Bold", align="center")

    # Title
    draw_text(c, "hello.ai", W/2, H - 85*mm, size=42, color=white, font="Helvetica-Bold", align="center")
    draw_text(c, "AI-Powered Receptionist for Local Businesses", W/2, H - 98*mm, size=18, color=SLATE, align="center")

    # Divider
    c.saveState()
    c.setFillColor(BLUE)
    c.rect(W/2 - 30*mm, H - 105*mm, 60*mm, 0.8*mm, fill=1, stroke=0)
    c.restoreState()

    draw_text(c, "Investor Presentation  -  March 2026", W/2, H - 115*mm, size=13, color=SLATE, align="center")
    draw_text(c, "CONFIDENTIAL", W/2, H - 125*mm, size=10, color=GRAY, align="center")

    # Tagline box
    draw_rounded_rect(c, 50*mm, 25*mm, W - 100*mm, 18*mm, 4*mm, DARK_CARD)
    draw_text(c, '"Never lose a customer to voicemail again."', W/2, 31*mm, size=14, color=white, font="Helvetica-Oblique", align="center")

    footer(c)

    # ==================================================================
    # SLIDE 2: THE PROBLEM
    # ==================================================================
    new_slide(c)
    draw_top_bar(c)
    heading(c, "The Problem", 25*mm, H - 22*mm, size=30)
    c.setFillColor(BLUE)
    c.rect(25*mm, H - 25*mm, 40*mm, 0.8*mm, fill=1, stroke=0)

    # Stat boxes
    stats = [
        ("62%", "of calls to small businesses go unanswered", RED),
        ("$1,200+", "lost revenue per missed call on average", AMBER),
        ("85%", "of callers who reach voicemail never call back", RED),
        ("67%", "of customers hang up if they can't reach a human", AMBER),
    ]
    box_w = 55*mm
    gap = 8*mm
    start_x = (W - (4 * box_w + 3 * gap)) / 2
    for i, (num, desc, accent) in enumerate(stats):
        bx = start_x + i * (box_w + gap)
        by = H - 85*mm
        draw_rounded_rect(c, bx, by, box_w, 48*mm, 3*mm, LIGHT_GRAY)
        c.setFillColor(accent)
        c.rect(bx, by + 48*mm - 2.5*mm, box_w, 2.5*mm, fill=1, stroke=0)
        draw_text(c, num, bx + box_w/2, by + 32*mm, size=22, color=accent, font="Helvetica-Bold", align="center")
        # Wrap description
        lines = desc.split(" ")
        line1 = " ".join(lines[:len(lines)//2])
        line2 = " ".join(lines[len(lines)//2:])
        draw_text(c, line1, bx + box_w/2, by + 18*mm, size=8.5, color=GRAY, align="center")
        draw_text(c, line2, bx + box_w/2, by + 11*mm, size=8.5, color=GRAY, align="center")

    # Pain points box
    draw_rounded_rect(c, 25*mm, 18*mm, W - 50*mm, 52*mm, 4*mm, HexColor("#FEF2F2"))
    heading(c, "The Reality for Local Businesses", 35*mm, 60*mm, size=14, color=RED)

    pain_points = [
        "Plumbers miss emergency calls while on-site -- customers call competitors instead.",
        "Dental offices lose after-hours appointment requests to other practices.",
        "HVAC technicians can't answer phones during summer rush -- losing $500+ jobs.",
        "Solo attorneys miss potential high-value client inquiries during court appearances.",
        "Salons lose walk-in and late-night booking opportunities every single day.",
    ]
    draw_bullet_list(c, pain_points, 37*mm, 52*mm, size=9, color=HexColor("#7F1D1D"), spacing=8*mm)

    footer(c)

    # ==================================================================
    # SLIDE 3: THE SOLUTION
    # ==================================================================
    new_slide(c)
    draw_top_bar(c)
    heading(c, "Our Solution", 25*mm, H - 22*mm, size=30)
    c.setFillColor(BLUE)
    c.rect(25*mm, H - 25*mm, 40*mm, 0.8*mm, fill=1, stroke=0)

    draw_text(c, "hello.ai gives every local business an AI-powered phone receptionist that answers calls 24/7,", 25*mm, H - 35*mm, size=11, color=GRAY)
    draw_text(c, "has natural conversations, books appointments, and sends instant SMS & email summaries to the owner.", 25*mm, H - 43*mm, size=11, color=GRAY)

    # 6 capability cards (2 rows x 3 cols)
    capabilities = [
        ("AI Voice Agent", "Natural, human-like phone conversations", "powered by GPT-4o + ElevenLabs + Deepgram"),
        ("Instant SMS Summary", "After every call, the owner gets an SMS", "with caller name, need, urgency & link"),
        ("Email Notifications", "Rich HTML email summaries with urgency", "indicators and one-click transcript access"),
        ("Appointment Booking", "AI collects scheduling preferences", "and can book appointments directly"),
        ("Industry Templates", "Pre-built prompts for 7 industries:", "plumbers, dentists, salons, lawyers, etc."),
        ("Analytics Dashboard", "Call volume trends, sentiment analysis,", "urgency breakdown, 30-day charts"),
    ]
    card_w = 75*mm
    card_h = 32*mm
    cgap_x = 8*mm
    cgap_y = 6*mm
    csx = (W - (3 * card_w + 2 * cgap_x)) / 2

    for idx, (title, line1, line2) in enumerate(capabilities):
        col = idx % 3
        row = idx // 3
        cx = csx + col * (card_w + cgap_x)
        cy = H - 55*mm - row * (card_h + cgap_y) - card_h
        draw_rounded_rect(c, cx, cy, card_w, card_h, 3*mm, LIGHT_BLUE)
        draw_text(c, title, cx + 5*mm, cy + card_h - 8*mm, size=11, color=TEXT_BLACK, font="Helvetica-Bold")
        draw_text(c, line1, cx + 5*mm, cy + card_h - 17*mm, size=8, color=GRAY)
        draw_text(c, line2, cx + 5*mm, cy + card_h - 23*mm, size=8, color=GRAY)

    # Bottom banner
    draw_rounded_rect(c, 25*mm, 12*mm, W - 50*mm, 16*mm, 4*mm, BLUE)
    draw_text(c, "Setup in 5 minutes   |   No hardware needed   |   Works with any phone", W/2, 18*mm, size=13, color=white, font="Helvetica-Bold", align="center")

    footer(c)

    # ==================================================================
    # SLIDE 4: HOW IT WORKS
    # ==================================================================
    new_slide(c)
    draw_top_bar(c)
    heading(c, "How It Works", 25*mm, H - 22*mm, size=30)
    c.setFillColor(BLUE)
    c.rect(25*mm, H - 25*mm, 40*mm, 0.8*mm, fill=1, stroke=0)

    steps = [
        ("1", "Customer Calls", "Customer dials the", "business phone number", "(Twilio-powered)"),
        ("2", "AI Answers", "Vapi.ai voice agent", "answers with custom", "greeting (GPT-4o-mini)"),
        ("3", "Smart Chat", "AI handles inquiries,", "collects info, books", "appointments naturally"),
        ("4", "Data Extract", "OpenAI extracts name,", "need, urgency, sentiment", "and call outcome"),
        ("5", "Owner Notified", "SMS + email summary", "sent instantly with", "urgency & dashboard link"),
        ("6", "Dashboard", "Owner reviews transcript,", "listens to recording,", "manages follow-ups"),
    ]
    sw = 37*mm
    sgap = 5*mm
    total_sw = 6 * sw + 5 * sgap
    ssx = (W - total_sw) / 2
    sy = H - 40*mm

    for i, (num, title, l1, l2, l3) in enumerate(steps):
        sx = ssx + i * (sw + sgap)
        card_bottom = sy - 55*mm
        draw_rounded_rect(c, sx, card_bottom, sw, 55*mm, 3*mm, LIGHT_GRAY)
        # Number circle
        draw_circle(c, sx + sw/2, card_bottom + 47*mm, 6*mm, BLUE)
        draw_text(c, num, sx + sw/2, card_bottom + 45*mm, size=12, color=white, font="Helvetica-Bold", align="center")
        # Title
        draw_text(c, title, sx + sw/2, card_bottom + 35*mm, size=9, color=TEXT_BLACK, font="Helvetica-Bold", align="center")
        # Description
        draw_text(c, l1, sx + sw/2, card_bottom + 25*mm, size=7, color=GRAY, align="center")
        draw_text(c, l2, sx + sw/2, card_bottom + 19*mm, size=7, color=GRAY, align="center")
        draw_text(c, l3, sx + sw/2, card_bottom + 13*mm, size=7, color=GRAY, align="center")
        # Arrow
        if i < 5:
            draw_text(c, ">", sx + sw + sgap/2, card_bottom + 28*mm, size=14, color=BLUE, font="Helvetica-Bold", align="center")

    # Tech stack section
    draw_rounded_rect(c, 25*mm, 12*mm, W - 50*mm, 50*mm, 4*mm, DARK_BG)
    heading(c, "Technology Stack", 35*mm, 52*mm, size=14, color=white)

    tech = [
        ("Frontend", "Next.js 14, React 18, TypeScript", "Tailwind CSS, shadcn/ui, Recharts"),
        ("Backend", "Next.js API Routes, Supabase", "(PostgreSQL), Row-Level Security"),
        ("AI / Voice", "Vapi.ai (Voice), OpenAI GPT-4o-mini", "ElevenLabs (TTS), Deepgram (STT)"),
        ("Infra", "Vercel (Hosting), Twilio (Telephony)", "Stripe (Payments), Resend (Email)"),
    ]
    tw = 55*mm
    tgap = 6*mm
    tsx = 35*mm
    for i, (label, l1, l2) in enumerate(tech):
        tx = tsx + i * (tw + tgap)
        draw_rounded_rect(c, tx, 18*mm, tw, 28*mm, 3*mm, DARK_CARD)
        draw_text(c, label, tx + 4*mm, 40*mm, size=10, color=BLUE, font="Helvetica-Bold")
        draw_text(c, l1, tx + 4*mm, 33*mm, size=7.5, color=LIGHT_SLATE)
        draw_text(c, l2, tx + 4*mm, 26*mm, size=7.5, color=LIGHT_SLATE)

    footer(c)

    # ==================================================================
    # SLIDE 5: MARKET OPPORTUNITY
    # ==================================================================
    new_slide(c)
    draw_top_bar(c)
    heading(c, "Market Opportunity", 25*mm, H - 22*mm, size=30)
    c.setFillColor(BLUE)
    c.rect(25*mm, H - 25*mm, 40*mm, 0.8*mm, fill=1, stroke=0)

    # TAM/SAM/SOM circles
    draw_circle(c, 110*mm, H/2 - 5*mm, 50*mm, PALE_BLUE)
    draw_circle(c, 130*mm, H/2 - 5*mm, 36*mm, LIGHT_BLUE)
    draw_circle(c, 148*mm, H/2 - 8*mm, 22*mm, HexColor("#93C5FD"))

    draw_text(c, "TAM", 72*mm, H/2 + 28*mm, size=10, color=BLUE, font="Helvetica-Bold")
    draw_text(c, "SAM", 110*mm, H/2 + 10*mm, size=10, color=DARK_BLUE, font="Helvetica-Bold")
    draw_text(c, "SOM", 148*mm, H/2 - 12*mm, size=9, color=DARK_BLUE, font="Helvetica-Bold")

    # Labels on the left
    draw_text(c, "TAM: $28B", 25*mm, H - 40*mm, size=18, color=DARK_BLUE, font="Helvetica-Bold")
    draw_text(c, "Total US SMB communication,", 25*mm, H - 48*mm, size=8.5, color=GRAY)
    draw_text(c, "answering services & virtual receptionist market", 25*mm, H - 55*mm, size=8.5, color=GRAY)

    draw_text(c, "SAM: $8.4B", 25*mm, H - 70*mm, size=16, color=DARK_BLUE, font="Helvetica-Bold")
    draw_text(c, "Service-based local businesses", 25*mm, H - 78*mm, size=8.5, color=GRAY)
    draw_text(c, "across our 7 target verticals", 25*mm, H - 85*mm, size=8.5, color=GRAY)

    draw_text(c, "SOM: $840M", 25*mm, H - 100*mm, size=14, color=DARK_BLUE, font="Helvetica-Bold")
    draw_text(c, "Early-adopter SMBs in top 50", 25*mm, H - 108*mm, size=8.5, color=GRAY)
    draw_text(c, "US metro areas, Year 1-3 target", 25*mm, H - 115*mm, size=8.5, color=GRAY)

    # Right side key stats
    draw_rounded_rect(c, W - 95*mm, 18*mm, 80*mm, H - 45*mm, 4*mm, LIGHT_GRAY)
    heading(c, "Key Market Data", W - 87*mm, H - 35*mm, size=13, color=TEXT_BLACK)

    market_stats = [
        ("33.2M", "Small businesses in the US"),
        ("72%", "Use personal phones for business"),
        ("$75B", "Lost annually to missed calls"),
        ("4.8%", "Answering service market CAGR"),
        ("< 5%", "AI penetration in SMB telephony"),
        ("91%", "Of SMBs want better call handling"),
    ]
    my = H - 50*mm
    for val, desc in market_stats:
        draw_text(c, val, W - 87*mm, my, size=13, color=BLUE, font="Helvetica-Bold")
        draw_text(c, desc, W - 87*mm, my - 8*mm, size=8, color=GRAY)
        my -= 20*mm

    footer(c)

    # ==================================================================
    # SLIDE 6: BUSINESS MODEL & PRICING
    # ==================================================================
    new_slide(c)
    draw_top_bar(c)
    heading(c, "Business Model", 25*mm, H - 22*mm, size=30)
    c.setFillColor(BLUE)
    c.rect(25*mm, H - 25*mm, 40*mm, 0.8*mm, fill=1, stroke=0)
    draw_text(c, "SaaS subscription model with tiered pricing. Freemium funnel drives organic acquisition.", 25*mm, H - 33*mm, size=11, color=GRAY)

    plans = [
        ("Free", "$0", "/month", "5 calls/mo", [
            "AI call answering", "SMS summaries", "Call transcripts", "Basic analytics"
        ], LIGHT_GRAY, False),
        ("Starter", "$29", "/month", "50 calls/mo", [
            "Everything in Free", "Email notifications", "Appointment booking",
            "Custom greeting", "Call recording"
        ], white, True),
        ("Pro", "$59", "/month", "200 calls/mo", [
            "Everything in Starter", "Advanced AI customization", "Multiple phone numbers",
            "Team member access", "Analytics dashboard", "API access"
        ], LIGHT_GRAY, False),
    ]

    card_w = 72*mm
    card_gap = 10*mm
    cx_start = (W - (3 * card_w + 2 * card_gap)) / 2
    card_h = 85*mm
    card_bottom = H - 40*mm - card_h

    for i, (name, price, period, limit, features, bg, popular) in enumerate(plans):
        cx = cx_start + i * (card_w + card_gap)
        cy = card_bottom

        if popular:
            draw_rounded_rect(c, cx - 1*mm, cy - 1*mm, card_w + 2*mm, card_h + 2*mm, 5*mm, BLUE)
            draw_rounded_rect(c, cx, cy, card_w, card_h, 4*mm, white)
            # Badge
            draw_rounded_rect(c, cx + 12*mm, cy + card_h - 3*mm, 48*mm, 8*mm, 3*mm, BLUE)
            draw_text(c, "MOST POPULAR", cx + 36*mm, cy + card_h - 0.5*mm, size=7, color=white, font="Helvetica-Bold", align="center")
        else:
            draw_rounded_rect(c, cx, cy, card_w, card_h, 4*mm, bg)

        # Plan name
        draw_text(c, name, cx + card_w/2, cy + card_h - 14*mm, size=16, color=TEXT_BLACK, font="Helvetica-Bold", align="center")
        # Price
        draw_text(c, price, cx + card_w/2 - 5*mm, cy + card_h - 26*mm, size=26, color=TEXT_BLACK, font="Helvetica-Bold", align="center")
        draw_text(c, period, cx + card_w/2 + 14*mm, cy + card_h - 26*mm, size=10, color=GRAY)
        # Limit
        draw_text(c, limit, cx + card_w/2, cy + card_h - 34*mm, size=9, color=BLUE, font="Helvetica-Bold", align="center")

        # Features
        fy = cy + card_h - 42*mm
        for feat in features:
            draw_text(c, "+  " + feat, cx + 8*mm, fy, size=8, color=TEXT_BLACK)
            fy -= 7*mm

    # Revenue model box at bottom
    draw_rounded_rect(c, 25*mm, 12*mm, W - 50*mm, 22*mm, 4*mm, DARK_BG)
    heading(c, "Revenue Drivers", 35*mm, 28*mm, size=12, color=white)
    rev = [
        "Freemium to Starter conversion (target: 15%)",
        "Starter to Pro upsell (target: 25%)",
        "Per-call overage fees beyond plan limits",
        "Annual billing discount (20% savings)",
    ]
    for i, item in enumerate(rev):
        col = i % 2
        row = i // 2
        x = 35*mm + col * 120*mm
        y = 20*mm - row * 5*mm
        draw_text(c, "-  " + item, x, y, size=8, color=SLATE)

    footer(c)

    # ==================================================================
    # SLIDE 7: GO-TO-MARKET STRATEGY
    # ==================================================================
    new_slide(c)
    draw_top_bar(c)
    heading(c, "Go-to-Market Strategy", 25*mm, H - 22*mm, size=30)
    c.setFillColor(BLUE)
    c.rect(25*mm, H - 25*mm, 40*mm, 0.8*mm, fill=1, stroke=0)

    phases = [
        ("Phase 1: Launch", "Months 1-6", BLUE, [
            "Target plumbers & HVAC -- highest urgency, highest LTV",
            "Content marketing: 'Why you lose $1,200 per missed call'",
            "Google Ads targeting 'answering service for [industry]'",
            "Free tier drives signups; in-app upgrade prompts",
            "Partner with trade associations & Facebook groups",
        ]),
        ("Phase 2: Expand", "Months 7-12", DARK_BLUE, [
            "Expand to all 7 verticals (dentists, salons, lawyers...)",
            "Launch referral program (1 free month per referral)",
            "Integrate with popular CRMs (HubSpot, ServiceTitan)",
            "Hire 2 sales reps for outbound to multi-location biz",
            "Develop case studies with early adopter successes",
        ]),
        ("Phase 3: Scale", "Year 2+", DARK_BG, [
            "White-label product for franchise groups",
            "Enterprise tier with SLA and dedicated support",
            "Expand to international markets (UK, CA, AU)",
            "Build AI agent marketplace for custom solutions",
            "Explore vertical SaaS acquisitions",
        ]),
    ]

    pw = 78*mm
    pgap = 7*mm
    psx = (W - (3 * pw + 2 * pgap)) / 2
    ph = 88*mm
    pby = H - 35*mm - ph

    for i, (title, timeline, color, items) in enumerate(phases):
        px = psx + i * (pw + pgap)
        draw_rounded_rect(c, px, pby, pw, ph, 4*mm, LIGHT_GRAY)
        # Header
        draw_rounded_rect(c, px, pby + ph - 16*mm, pw, 16*mm, 4*mm, color)
        c.setFillColor(color)
        c.rect(px, pby + ph - 16*mm, pw, 8*mm, fill=1, stroke=0)
        draw_text(c, title, px + 5*mm, pby + ph - 8*mm, size=11, color=white, font="Helvetica-Bold")
        draw_text(c, timeline, px + 5*mm, pby + ph - 14*mm, size=8, color=white)

        iy = pby + ph - 24*mm
        for item in items:
            draw_text(c, "-  " + item, px + 5*mm, iy, size=7, color=TEXT_BLACK)
            iy -= 10*mm

    # Channel mix
    draw_rounded_rect(c, 25*mm, 12*mm, W - 50*mm, 24*mm, 4*mm, LIGHT_BLUE)
    heading(c, "Acquisition Channels", 35*mm, 30*mm, size=12, color=DARK_BLUE)
    channels = [("SEO/Content", "35%"), ("Paid Ads", "25%"), ("Referrals", "20%"), ("Partnerships", "15%"), ("Outbound", "5%")]
    chx = 35*mm
    for ch_name, pct in channels:
        draw_text(c, pct, chx, 22*mm, size=14, color=BLUE, font="Helvetica-Bold")
        draw_text(c, ch_name, chx, 16*mm, size=8, color=GRAY)
        chx += 48*mm

    footer(c)

    # ==================================================================
    # SLIDE 8: COMPETITIVE LANDSCAPE
    # ==================================================================
    new_slide(c)
    draw_top_bar(c)
    heading(c, "Competitive Landscape", 25*mm, H - 22*mm, size=30)
    c.setFillColor(BLUE)
    c.rect(25*mm, H - 25*mm, 40*mm, 0.8*mm, fill=1, stroke=0)

    headers = ["Feature", "hello.ai", "Ruby Receptionists", "Smith.ai", "Answering Svc"]
    col_widths = [52*mm, 47*mm, 47*mm, 47*mm, 47*mm]
    tx = 25*mm
    ty = H - 38*mm
    row_h = 8.5*mm

    # Header row
    draw_rounded_rect(c, tx, ty - row_h, sum(col_widths), row_h, 0, DARK_BG)
    hx = tx
    for j, (h, cw) in enumerate(zip(headers, col_widths)):
        draw_text(c, h, hx + cw/2, ty - row_h + 2.5*mm, size=8, color=white, font="Helvetica-Bold", align="center")
        hx += cw

    rows_data = [
        ("24/7 AI Answering", "Yes", "No (human only)", "Partial", "No"),
        ("Setup Time", "5 minutes", "Days", "Hours", "Days-Weeks"),
        ("Monthly Cost", "From $0", "From $449", "From $292", "From $200+"),
        ("Per-Call Cost", "Included", "$1.75-$2.50", "$2.40-$6.00", "$1.00-$3.00"),
        ("SMS Summaries", "Instant", "Delayed", "Available", "Basic"),
        ("Call Transcripts", "Full AI", "None", "Basic", "None"),
        ("Industry Templates", "7 built-in", "None", "None", "None"),
        ("AI Data Extraction", "Full NLP", "None", "Basic", "None"),
        ("Appointment Booking", "AI-powered", "Human", "Human", "Manual"),
        ("Urgency Detection", "AI auto-detect", "Human judgment", "Basic", "None"),
        ("Analytics Dashboard", "Rich charts", "Basic reports", "Basic", "None"),
        ("Scalability", "Unlimited", "Staff-limited", "Staff-limited", "Staff-limited"),
    ]

    for ri, (feature, *vals) in enumerate(rows_data):
        ry = ty - (ri + 2) * row_h
        bg = LIGHT_GRAY if ri % 2 == 0 else white
        c.setFillColor(bg)
        c.rect(tx, ry, sum(col_widths), row_h, fill=1, stroke=0)

        rx = tx
        draw_text(c, feature, rx + 3*mm, ry + 2.5*mm, size=7.5, color=TEXT_BLACK)
        rx += col_widths[0]
        for ci, val in enumerate(vals):
            color = GREEN if ci == 0 else GRAY
            font = "Helvetica-Bold" if ci == 0 else "Helvetica"
            draw_text(c, val, rx + col_widths[ci+1]/2, ry + 2.5*mm, size=7.5, color=color, font=font, align="center")
            rx += col_widths[ci+1]

    # Bottom insight
    adv_y = ty - (len(rows_data) + 2) * row_h - 4*mm
    draw_rounded_rect(c, 25*mm, adv_y, W - 50*mm, 18*mm, 4*mm, LIGHT_BLUE)
    heading(c, "Our Unfair Advantage", 35*mm, adv_y + 11*mm, size=12, color=DARK_BLUE)
    draw_text(c, "10-50x cheaper than human services  |  Instant setup vs. days/weeks  |  AI improves with every call  |  Scales infinitely", 35*mm, adv_y + 4*mm, size=8.5, color=GRAY)

    footer(c)

    # ==================================================================
    # SLIDE 9: FINANCIAL PROJECTIONS
    # ==================================================================
    new_slide(c)
    draw_top_bar(c)
    heading(c, "Financial Projections", 25*mm, H - 22*mm, size=30)
    c.setFillColor(BLUE)
    c.rect(25*mm, H - 25*mm, 40*mm, 0.8*mm, fill=1, stroke=0)

    proj_headers = ["Metric", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]
    proj_widths = [58*mm, 36*mm, 36*mm, 36*mm, 36*mm, 36*mm]
    ptx = 28*mm
    pty = H - 38*mm
    prh = 8.5*mm

    # Header
    c.setFillColor(DARK_BG)
    c.rect(ptx, pty - prh, sum(proj_widths), prh, fill=1, stroke=0)
    phx = ptx
    for h, pw_val in zip(proj_headers, proj_widths):
        draw_text(c, h, phx + pw_val/2, pty - prh + 2.5*mm, size=8.5, color=white, font="Helvetica-Bold", align="center")
        phx += pw_val

    proj_rows = [
        ("Total Customers", "500", "2,500", "8,000", "20,000", "45,000"),
        ("Paid Customers", "75", "500", "2,000", "6,000", "15,000"),
        ("Monthly Revenue (MRR)", "$3K", "$20K", "$85K", "$270K", "$680K"),
        ("Annual Recurring Revenue", "$36K", "$240K", "$1.02M", "$3.24M", "$8.16M"),
        ("Gross Margin", "78%", "82%", "85%", "87%", "89%"),
        ("Monthly Burn Rate", "$15K", "$35K", "$60K", "$80K", "$100K"),
        ("Breakeven Month", "--", "Month 18", "--", "--", "--"),
        ("Customer Acq. Cost (CAC)", "$120", "$85", "$60", "$45", "$35"),
        ("Lifetime Value (LTV)", "$580", "$720", "$900", "$1,100", "$1,300"),
        ("LTV:CAC Ratio", "4.8x", "8.5x", "15x", "24x", "37x"),
    ]

    for ri, (metric, *vals) in enumerate(proj_rows):
        ry = pty - (ri + 2) * prh
        bg = LIGHT_GRAY if ri % 2 == 0 else white
        c.setFillColor(bg)
        c.rect(ptx, ry, sum(proj_widths), prh, fill=1, stroke=0)

        is_arr = ri == 3
        draw_text(c, metric, ptx + 3*mm, ry + 2.5*mm, size=8, color=TEXT_BLACK, font="Helvetica-Bold" if is_arr else "Helvetica")

        for ci, val in enumerate(vals):
            color = GREEN if is_arr else TEXT_BLACK
            draw_text(c, val, ptx + sum(proj_widths[:ci+1]) + proj_widths[ci+1]/2, ry + 2.5*mm, size=8, color=color, font="Helvetica-Bold" if is_arr else "Helvetica", align="center")

    # Assumptions
    ass_y = pty - (len(proj_rows) + 2) * prh - 6*mm
    draw_rounded_rect(c, 28*mm, ass_y, W - 56*mm, 30*mm, 4*mm, LIGHT_BLUE)
    heading(c, "Key Assumptions", 38*mm, ass_y + 23*mm, size=12, color=DARK_BLUE)
    assumptions = [
        "Avg. revenue per paid user: $40/mo blended (Starter & Pro mix)",
        "Free-to-paid conversion: 15% within first 60 days",
        "Monthly churn: 5% Year 1, improving to 3% by Year 3",
        "Cost per call (Twilio + Vapi + OpenAI): ~$0.15 average",
        "Primary acquisition: SEO content + Google Ads ($85 CAC Y1)",
        "Team: 2 founders + 3 hires Year 1, scaling to 20 by Year 3",
    ]
    ay = ass_y + 16*mm
    for i, a in enumerate(assumptions):
        col = i % 2
        row = i // 2
        x = 38*mm + col * 120*mm
        y = ay - row * 5.5*mm
        draw_text(c, "-  " + a, x, y, size=7.5, color=GRAY)

    footer(c)

    # ==================================================================
    # SLIDE 10: PRODUCT DEEP DIVE
    # ==================================================================
    new_slide(c)
    draw_top_bar(c)
    heading(c, "Product Deep Dive", 25*mm, H - 22*mm, size=30)
    c.setFillColor(BLUE)
    c.rect(25*mm, H - 25*mm, 40*mm, 0.8*mm, fill=1, stroke=0)

    sections = [
        ("Onboarding Wizard", [
            "4-step guided setup:",
            "1. Choose industry template",
            "2. Enter business details",
            "3. Customize AI greeting",
            "4. Test call with your AI",
            "",
            "Avg setup: under 5 minutes",
            "7 industry templates built-in",
        ]),
        ("Dashboard", [
            "Real-time analytics overview:",
            "- Calls today / month / total",
            "- Average call duration",
            "- 30-day call volume chart",
            "- Recent calls w/ urgency",
            "- Sentiment breakdown",
            "- Quick-action buttons",
            "",
        ]),
        ("Call Detail View", [
            "Full call intelligence:",
            "- Complete AI transcript",
            "- Caller name, phone, address",
            "- Urgency level (auto-detect)",
            "- Sentiment analysis score",
            "- Call outcome classification",
            "- Audio recording playback",
            "- SMS/email status",
        ]),
    ]

    sec_w = 78*mm
    sec_h = 70*mm
    sec_gap = 8*mm
    sec_sx = (W - (3 * sec_w + 2 * sec_gap)) / 2

    for i, (title, lines) in enumerate(sections):
        sx = sec_sx + i * (sec_w + sec_gap)
        sy = H - 38*mm - sec_h
        draw_rounded_rect(c, sx, sy, sec_w, sec_h, 4*mm, LIGHT_GRAY)
        # Header bar
        draw_rounded_rect(c, sx, sy + sec_h - 12*mm, sec_w, 12*mm, 4*mm, BLUE)
        c.setFillColor(BLUE)
        c.rect(sx, sy + sec_h - 12*mm, sec_w, 5*mm, fill=1, stroke=0)
        draw_text(c, title, sx + 5*mm, sy + sec_h - 9*mm, size=10, color=white, font="Helvetica-Bold")
        # Content
        ly = sy + sec_h - 20*mm
        for line in lines:
            draw_text(c, line, sx + 5*mm, ly, size=7.5, color=GRAY)
            ly -= 6*mm

    # Additional features at bottom
    draw_rounded_rect(c, 25*mm, 12*mm, W - 50*mm, 45*mm, 4*mm, DARK_BG)
    heading(c, "Additional Platform Capabilities", 35*mm, 50*mm, size=13, color=white)

    add_features = [
        ("Settings Management", "Full control over business info, hours,", "services, FAQs, custom AI instructions."),
        ("Billing & Subscriptions", "Stripe-powered billing with self-serve", "upgrade/downgrade and usage tracking."),
        ("Webhook Architecture", "Real-time webhooks from Vapi, Twilio,", "Stripe, Clerk for event processing."),
        ("Cron Jobs", "Automated daily digest emails and", "monthly call counter resets via Vercel."),
    ]
    fw = 55*mm
    fgap = 7*mm
    fsx = 35*mm
    for i, (ftitle, fl1, fl2) in enumerate(add_features):
        fx = fsx + i * (fw + fgap)
        draw_rounded_rect(c, fx, 16*mm, fw, 28*mm, 3*mm, DARK_CARD)
        draw_text(c, ftitle, fx + 4*mm, 38*mm, size=9, color=BLUE, font="Helvetica-Bold")
        draw_text(c, fl1, fx + 4*mm, 30*mm, size=7.5, color=LIGHT_SLATE)
        draw_text(c, fl2, fx + 4*mm, 24*mm, size=7.5, color=LIGHT_SLATE)

    footer(c)

    # ==================================================================
    # SLIDE 11: TRACTION & ROADMAP
    # ==================================================================
    new_slide(c)
    draw_top_bar(c)
    heading(c, "Traction & Roadmap", 25*mm, H - 22*mm, size=30)
    c.setFillColor(BLUE)
    c.rect(25*mm, H - 25*mm, 40*mm, 0.8*mm, fill=1, stroke=0)

    # Built & Ready box
    draw_rounded_rect(c, 25*mm, H - 105*mm, 118*mm, 70*mm, 4*mm, LIGHT_BLUE)
    heading(c, "Built & Ready", 35*mm, H - 40*mm, size=15, color=DARK_BLUE)

    achieved = [
        "Full-stack MVP complete and deployed on Vercel",
        "7 industry templates with optimized AI prompts",
        "End-to-end call flow: Twilio > Vapi > OpenAI > SMS/Email",
        "Stripe billing integration with 3-tier pricing",
        "Real-time analytics dashboard with 30-day charts",
        "Multi-step onboarding wizard with test-call feature",
        "Row-Level Security on all database tables",
        "Clerk authentication with webhook sync",
    ]
    ay_val = H - 50*mm
    for item in achieved:
        draw_text(c, "[ok]  " + item, 37*mm, ay_val, size=8, color=TEXT_BLACK)
        ay_val -= 7*mm

    # Roadmap box
    draw_rounded_rect(c, 153*mm, H - 105*mm, 118*mm, 70*mm, 4*mm, LIGHT_GRAY)
    heading(c, "Upcoming Roadmap", 163*mm, H - 40*mm, size=15, color=TEXT_BLACK)

    roadmap = [
        ("Q2 2026", "Beta launch, first 50 paying customers"),
        ("Q3 2026", "CRM integrations (HubSpot, ServiceTitan)"),
        ("Q4 2026", "Mobile app for business owners"),
        ("Q1 2027", "Multi-language support (Spanish first)"),
        ("Q2 2027", "White-label for franchise groups"),
        ("Q3 2027", "International expansion -- UK & Canada"),
    ]
    ry_val = H - 50*mm
    for q, desc in roadmap:
        draw_text(c, q, 163*mm, ry_val, size=8, color=BLUE, font="Helvetica-Bold")
        draw_text(c, desc, 185*mm, ry_val, size=8, color=GRAY)
        ry_val -= 9*mm

    # 12-month targets
    draw_rounded_rect(c, 25*mm, 32*mm, W - 50*mm, 28*mm, 4*mm, DARK_BG)
    heading(c, "12-Month Targets", 35*mm, 54*mm, size=13, color=white)

    targets = [
        ("500+", "Businesses Onboarded"),
        ("75+", "Paid Subscribers"),
        ("2,500+", "AI Calls Handled"),
        ("$3K+", "Monthly Recurring Rev"),
        ("< 5%", "Monthly Churn Rate"),
    ]
    tw_val = 42*mm
    tgap = 7*mm
    tsx_val = (W - (5 * tw_val + 4 * tgap)) / 2
    for i, (val, label) in enumerate(targets):
        tx_val = tsx_val + i * (tw_val + tgap)
        draw_rounded_rect(c, tx_val, 34*mm, tw_val, 16*mm, 3*mm, DARK_CARD)
        draw_text(c, val, tx_val + tw_val/2, 44*mm, size=13, color=GREEN, font="Helvetica-Bold", align="center")
        draw_text(c, label, tx_val + tw_val/2, 37*mm, size=7, color=SLATE, align="center")

    # Industries
    draw_rounded_rect(c, 25*mm, 12*mm, W - 50*mm, 16*mm, 4*mm, LIGHT_BLUE)
    heading(c, "Target Industries:", 35*mm, 20*mm, size=10, color=DARK_BLUE)
    industries = ["Plumbing", "HVAC", "Dental", "Salons", "Legal", "Electrical", "General"]
    ix = 85*mm
    for ind in industries:
        draw_text(c, ind, ix, 20*mm, size=9, color=TEXT_BLACK, font="Helvetica-Bold")
        ix += 28*mm

    footer(c)

    # ==================================================================
    # SLIDE 12: THE ASK
    # ==================================================================
    new_slide(c)
    draw_top_bar(c)
    heading(c, "The Ask", 25*mm, H - 22*mm, size=30)
    c.setFillColor(BLUE)
    c.rect(25*mm, H - 25*mm, 40*mm, 0.8*mm, fill=1, stroke=0)

    # Left: Funding details
    draw_rounded_rect(c, 25*mm, 38*mm, 128*mm, H - 70*mm, 4*mm, LIGHT_BLUE)
    heading(c, "Raising: $500K Pre-Seed", 35*mm, H - 40*mm, size=18, color=DARK_BLUE)
    draw_text(c, "Instrument: SAFE with $5M valuation cap", 35*mm, H - 50*mm, size=11, color=GRAY)

    use_of_funds = [
        ("Engineering (40%) - $200K", "Hire 2 full-stack engineers, scale infrastructure"),
        ("Sales & Marketing (30%) - $150K", "Content, paid ads, partnership development"),
        ("Operations (15%) - $75K", "Customer success, Twilio/Vapi costs, tooling"),
        ("Reserve (15%) - $75K", "6-month runway buffer"),
    ]
    uy = H - 62*mm
    for title, desc in use_of_funds:
        draw_text(c, title, 37*mm, uy, size=9, color=DARK_BLUE, font="Helvetica-Bold")
        draw_text(c, desc, 37*mm, uy - 6*mm, size=8, color=GRAY)
        uy -= 16*mm

    # Right: Why invest
    draw_rounded_rect(c, 163*mm, 38*mm, 108*mm, H - 70*mm, 4*mm, DARK_BG)
    heading(c, "Why Invest Now?", 173*mm, H - 40*mm, size=15, color=white)

    why_invest = [
        "Massive market -- $28B TAM, < 5% AI penetration",
        "Product is built and ready for launch",
        "Unit economics work: 89% gross margins at scale",
        "10-50x cheaper than incumbent solutions",
        "AI-native -- scales with zero marginal cost",
        "SMBs actively seeking AI solutions (strong tailwinds)",
        "Clear path to $1M ARR within 3 years",
    ]
    wy = H - 53*mm
    for item in why_invest:
        draw_text(c, "->  " + item, 175*mm, wy, size=8, color=LIGHT_SLATE)
        wy -= 10*mm

    # Milestones
    draw_rounded_rect(c, 25*mm, 12*mm, W - 50*mm, 22*mm, 4*mm, LIGHT_GRAY)
    heading(c, "Key Milestones This Round Will Unlock", 35*mm, 28*mm, size=12, color=TEXT_BLACK)
    milestones = ["500 businesses onboarded", "75+ paying customers", "$3K MRR by Month 12", "Series A readiness", "2 CRM integrations"]
    mx = 35*mm
    for m in milestones:
        draw_text(c, "[ok] " + m, mx, 18*mm, size=8, color=BLUE, font="Helvetica-Bold")
        mx += 48*mm

    footer(c)

    # ==================================================================
    # SLIDE 13: CLOSING
    # ==================================================================
    new_slide(c, bg=DARK_BG)

    # Decorative
    draw_circle(c, 60*mm, H - 30*mm, 60*mm, HexColor("#1E3A8A"))
    draw_circle(c, W - 40*mm, 30*mm, 45*mm, HexColor("#1E3A8A"))

    # Logo
    draw_circle(c, W/2, H - 45*mm, 14*mm, BLUE)
    draw_text(c, "MC", W/2, H - 49*mm, size=16, color=white, font="Helvetica-Bold", align="center")

    draw_text(c, "hello.ai", W/2, H - 75*mm, size=36, color=white, font="Helvetica-Bold", align="center")
    draw_text(c, "Never Lose a Customer to Voicemail Again.", W/2, H - 88*mm, size=16, color=SLATE, align="center")

    # Divider
    c.setFillColor(BLUE)
    c.rect(W/2 - 30*mm, H - 95*mm, 60*mm, 0.8*mm, fill=1, stroke=0)

    takeaways = [
        "$28B market opportunity with < 5% AI penetration",
        "10-50x cheaper than human answering services",
        "Full product built -- ready for paying customers",
        "Clear path to $8M+ ARR by Year 5",
    ]
    ty_val = H - 105*mm
    for t in takeaways:
        draw_text(c, "*  " + t, W/2, ty_val, size=11, color=LIGHT_SLATE, align="center")
        ty_val -= 9*mm

    # CTA box
    draw_rounded_rect(c, W/2 - 65*mm, 25*mm, 130*mm, 22*mm, 4*mm, BLUE)
    draw_text(c, "Let's Talk", W/2, 40*mm, size=14, color=white, font="Helvetica-Bold", align="center")
    draw_text(c, "hello@hello.ai  |  hello.ai", W/2, 32*mm, size=10, color=white, align="center")

    footer(c)

    # Save
    c.save()
    print(f"\n{'='*60}")
    print(f"  Investor deck generated successfully!")
    print(f"  {OUTPUT}")
    print(f"  {slide_num} slides  |  A4 Landscape")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    build()
