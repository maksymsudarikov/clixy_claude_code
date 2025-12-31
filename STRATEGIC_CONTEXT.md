# Clixy Strategic Context & Decisions

**Last Updated:** 2025-12-30
**Purpose:** Capture key strategic discussions and architectural decisions for future Claude sessions

---

## Table of Contents
1. [Product Positioning: Photographers → Producers](#product-positioning)
2. [Multi-Tenant Architecture Decision](#multi-tenant-architecture)
3. [Development Workflow Evolution](#development-workflow)
4. [Producer Pitch Strategy](#producer-pitch-strategy)
5. [FAQ for Future Development](#faq)

---

## Product Positioning

### The Strategic Pivot

**From:** Tool for individual photographers to organize shoots
**To:** Platform for producers coordinating multiple photographers and shoots

### Why Producers Are the Better Market

| Metric | Photographers | Producers | Impact |
|--------|--------------|-----------|---------|
| Shoots/month | 2-5 | 10-50 | 10x usage |
| Team coordination | Solo | 5-10 people | Higher complexity |
| Budget | $29/month | $99-499/month | 5-15x revenue |
| Pain level | "Nice to have" | "Critical blocker" | Higher urgency |
| Scale need | Individual workflow | Business operations | Must-have vs nice-to-have |

**Key Insight from Discussion:**
> "Producers might use it even more than professional photographers because they coordinate multiple shoots, manage client expectations across projects, and need professional tools to scale their business."

### The ROI for Producers

**Current State (Without Clixy):**
- 2 hours per shoot spent on coordination emails
- 10 shoots/month = 20 hours/month on admin
- At $100/hour rate = **$2,000 lost to coordination**

**With Clixy:**
- 15 minutes per shoot to set up
- 10 shoots/month = 2.5 hours/month
- **Saves 17.5 hours = $1,750/month value**

**Pricing at $99/month = 18:1 ROI**

---

## Multi-Tenant Architecture

### The Core Question
**"Should we copy codebase to different repository and make it neutral in appearance?"**

### Answer: NO - Use Multi-Tenant Architecture Instead

### The Problem
- Current site hard-coded with "Studio Olga Prudka®" branding
- Can't pitch to producers with Olga-specific copy
- Need to support multiple clients without code duplication

### The Solution: Single Codebase, Multiple Tenants

```
One Repository (current)
    ↓
Tenant Configuration
    ├── olga: "Studio Olga Prudka®" + specific features
    ├── generic: "Clixy" + neutral branding
    └── clientname: Client-specific branding
    ↓
Multiple Deployments
    ├── clixyspace.com (Olga's production site)
    ├── app.clixy.studio (Generic demo for producers)
    └── shoots.clientname.com (Future client sites)
```

### Why NOT Fork the Repository

**Seems Appealing:**
- Quick fix: copy repo, change branding
- Separate concerns (Olga vs generic)

**Actually a Nightmare:**
- Maintaining 2+ codebases manually
- Bug fix in one? Must copy to all others
- New feature? Implement 3x times
- Codebases diverge over time → impossible to sync
- 6 months later: technical debt hell

**Verdict:** Only viable if you have 1-2 clients and never plan to update the product.

### Multi-Tenant Architecture Benefits

✅ **One Codebase:** Single source of truth
✅ **Bug Fixes:** Apply to all tenants automatically
✅ **New Features:** Roll out to everyone at once
✅ **White-Label Ready:** Customize per client
✅ **Scales to 100+ Clients:** No code duplication

### How It Works

**Tenant Configuration:**
```typescript
// config/tenants.ts
export const tenants = {
  olga: {
    id: 'olga',
    studioName: 'Studio Olga Prudka®',
    logo: '/logos/olga.png',
    primaryColor: '#141413',
    secondaryColor: '#D8D9CF',
    contactEmail: 'art@olgaprudka.com',
    features: {
      giftCards: true,        // Olga-specific
      publicDashboard: true,  // Public portfolio
      customForms: true,
    }
  },
  generic: {
    id: 'generic',
    studioName: 'Clixy',
    logo: '/logos/clixy.png',
    primaryColor: '#141413',
    secondaryColor: '#D8D9CF',
    contactEmail: 'hello@clixy.studio',
    features: {
      giftCards: false,       // Not in generic
      publicDashboard: false, // Producers want privacy
      customForms: false,
    }
  }
}
```

**Component Usage:**
```typescript
// Before refactor:
<h1>Studio Olga Prudka®</h1>

// After refactor:
const { config } = useTenant();
<h1>{config.studioName}</h1>

// Result for olga tenant: "Studio Olga Prudka®"
// Result for generic tenant: "Clixy"
```

**Deployment:**
```bash
# Olga's production site
TENANT=olga npm run build
# Deploys to clixyspace.com, shows Olga branding

# Generic demo for producers
TENANT=generic npm run build
# Deploys to app.clixy.studio, shows Clixy branding
```

### Impact on Current Olga Site: ZERO

**Critical Question from Discussion:**
> "How will this multi-tenant refactoring affect my current page clixyspace.com with Olga's branding?"

**Answer:** NO IMPACT - Nothing changes for users

| Aspect | Before | After |
|--------|--------|-------|
| Branding | "Studio Olga Prudka®" | "Studio Olga Prudka®" (same) |
| Features | Current feature set | Same features |
| URL | clixyspace.com | clixyspace.com (same) |
| User Experience | Current UX | Identical UX |
| Performance | Current speed | Same or better |

**What Changes:**
- Internal code structure (config-driven)
- Developer ability to deploy multiple versions
- **User Experience:** Unchanged ✅

### Parallel Development Question
> "Will I be able to develop internal product in parallel?"

**Answer: YES - Multiple Development Patterns**

**Pattern 1: Feature for All Tenants**
```typescript
// Timeline improvement benefits everyone
function TimelineComponent() {
  // Works for all tenants automatically
}
```

**Pattern 2: Olga-Only Feature**
```typescript
function GiftCardSection() {
  const { config } = useTenant();

  if (!config.features.giftCards) return null;

  return <GiftCardPurchase />;
}
// Shows for Olga, hidden for generic and other clients
```

**Pattern 3: Producer-Only Feature**
```typescript
function MultiPhotographerDashboard() {
  const { config } = useTenant();

  if (config.id === 'olga') {
    return <SimplePhotographerView />;
  }

  return <ProducerComplexView />;
}
// Different experience per tenant
```

**Example Scenario:**
```
Week 1: Build "Client Approval" feature
- Producers need it (must have client sign-off)
- Olga doesn't need it yet

Solution:
- Build feature in main codebase
- Use feature flag: config.features.clientApproval
- olga tenant: false (hidden)
- generic tenant: true (visible)
- When Olga wants it later: flip flag to true

Result:
- Olga's site: Unchanged
- Generic demo: Shows new feature
- Same codebase, different configs
```

---

## Development Workflow

### Current Workflow (Phase 1)
```
Direct to Main:
- Develop directly on main branch
- Commit and push immediately
- Deploys to production automatically
- No staging environment
```

**Why It Works Now:**
- Solo developer (no conflicts)
- Low traffic (forgiving of bugs)
- Fast iteration (fix forward quickly)

**Why It Will Break:**
- Pitching to producers (can't show buggy demo)
- Multiple clients (can't test risky changes in prod)
- Team growth (merge conflicts, breaking changes)

### Planned Workflow (Phase 2)

```
Git Flow Lite:

Branches:
├── main (production - always stable)
│   └── Deploys to: clixyspace.com (Olga's live site)
├── develop (staging - integration)
│   └── Deploys to: staging.clixy.studio
└── feature/* (feature development)
    └── Deploys to: pr-123.clixy.studio (optional)
```

**New Process:**
1. **Feature Development:**
   ```bash
   git checkout -b feature/multi-photographer
   # Build feature
   git push origin feature/multi-photographer
   ```

2. **Test in Staging:**
   ```bash
   git checkout develop
   git merge feature/multi-photographer
   # Auto-deploys to staging.clixy.studio
   # Test thoroughly with producers
   ```

3. **Release to Production:**
   ```bash
   git checkout main
   git merge develop
   # Auto-deploys to clixyspace.com
   # Olga's site updated with stable features
   ```

### Deployment Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| **Production** | main | clixyspace.com | Olga's live site (always stable) |
| **Staging** | develop | staging.clixy.studio | Pre-production testing |
| **Preview** | feature/* | pr-123.clixy.studio | Optional per-PR previews |

**Recommended Platform:** Vercel (automatic preview deploys per branch, free tier)

---

## Producer Pitch Strategy

### Value Proposition
**"Stop losing hours to shoot coordination chaos. Give every client a premium, professional experience - automatically."**

### The Hook (30 seconds)
> "You're juggling 8 shoots next week. Client A is asking 'where's the call sheet?', Client B wants to know if editing started, and your photographer just asked what time the shoot is. Again. Sound familiar?"

### Demo Flow (2 minutes)

**Act 1: Client Onboarding** (30 sec)
- Show "Share Your Vision" form
- "This is how clients tell you what they want"
- Form submission creates shoot automatically

**Act 2: Shoot Setup** (30 sec)
- Create shoot with timeline, team, locations
- Add moodboard images
- Generate share link
- "60 seconds to set up, professional for months"

**Act 3: Client Experience - THE WOW MOMENT** (45 sec)
- Show client portal (beautiful branded page)
- Timeline with run-of-show
- Team contacts with photos
- Logistics (time, location, map)
- Documents (call sheet, moodboard)
- Status tracking (selection ready, editing, delivered)
- "This is what your clients see instead of email chaos"

**Act 4: Scale** (15 sec)
- Admin dashboard with 10 shoots
- Quick status updates
- Duplicate shoots
- "Manage 10 shoots in the time it used to take for 2"

### Competitive Positioning

**They might say: "Why not just use..."**

| Competitor | Their Problem | Clixy Answer |
|------------|---------------|--------------|
| **Email** | Threads get buried, unprofessional | "One link vs 47 email threads. Your clients see a branded portal, not your Gmail." |
| **Google Drive** | Generic, requires client tech-savvy | "Your clients aren't tech experts. Clixy guides them through everything." |
| **Notion** | DIY setup, not client-facing polished | "You're not a software developer. Clixy works out of the box." |
| **Honeybook/Iris** | Invoicing-focused, clunky for shoots | "Those are built for invoicing. Clixy is built for shoot day coordination." |

### ROI Proof Points

**Time Savings:**
```
Current: 2 hours per shoot on emails
With Clixy: 15 minutes setup

10 shoots/month:
- Before: 20 hours
- After: 2.5 hours
- Saved: 17.5 hours = $1,750 (at $100/hr)

Price: $99/month
ROI: 18:1
```

**Client Value:**
- Premium experience → more referrals
- Professional presentation → justify higher rates
- Reduced client anxiety → better reviews
- Brand reputation → competitive advantage

### Key Features to Demonstrate

**Must-Show:**
1. ✅ Admin Dashboard - Manage multiple shoots at glance
2. ✅ Client Portal - The visual wow factor
3. ✅ Status Tracking - Visual workflow (pending → delivered)
4. ✅ Secure Sharing - Professional access links
5. ✅ Team Coordination - Everyone's info in one place

**Mention in Roadmap:**
- White-label branding (their logo/colors)
- Multi-producer accounts (team members)
- Client feedback/approval system
- Calendar integration
- Automated notifications
- Analytics dashboard

### Pricing Strategy

| Tier | Price | Target Audience | Key Features |
|------|-------|-----------------|--------------|
| **Photographer** | $29/mo | Solo photographers | 10 shoots/month, basic |
| **Producer** | $99/mo | Small production cos | 30 shoots/month, 3 team members |
| **Agency** | $299/mo | Large agencies | Unlimited shoots, unlimited team, white-label |
| **Enterprise** | Custom | Multi-location studios | Custom domain, SLA, dedicated support |

**Why Producers Pay More:**
- Business expense (not personal tool)
- 10x more value (manage 10x more shoots)
- Time savings at higher rate ($100+/hr vs $50/hr)
- Critical business tool (not nice-to-have)

---

## Technical Implementation Plan

### Phase 1: Multi-Tenant Refactor (Week 1-2)

**Goal:** Enable white-label capability without breaking Olga's site

**Tasks:**
- [ ] Create `config/tenants.ts` with tenant configurations
- [ ] Create `hooks/useTenant.ts` for tenant context
- [ ] Extract all hard-coded "Studio Olga Prudka®" to `{config.studioName}`
- [ ] Replace hard-coded colors with CSS variables from config
- [ ] Create dynamic logo component using tenant config
- [ ] Build tenant detection logic (env variable first, domain-based later)
- [ ] Create "olga" tenant config (current branding)
- [ ] Create "generic" tenant config (neutral Clixy branding)
- [ ] Add feature flags per tenant
- [ ] Test both tenants independently
- [ ] Verify Olga's site unchanged after refactor

**Success Criteria:**
- Olga's site (TENANT=olga) looks identical to current
- Generic site (TENANT=generic) shows neutral branding
- Zero bugs introduced
- Can switch tenants with single env var

**Safety Protocol:**
1. Work in feature branch `feature/multi-tenant`
2. Test locally with both TENANT=olga and TENANT=generic
3. Deploy to staging first
4. Get approval before merging to main
5. Deploy to production during low-traffic time

---

### Phase 2: Staging Environment (Week 3)

**Goal:** Safe testing environment before production

**Platform Options:**

**Option 1: Vercel (Recommended)**
- Automatic preview deploys per branch
- Free tier sufficient for now
- Custom domains easy
- Setup time: 1 hour

**Option 2: Netlify**
- Similar to Vercel
- Visual diff testing
- Free tier generous
- Setup time: 1 hour

**Option 3: GitHub Pages + Actions**
- Already using for production
- Manual setup required
- Free but more work
- Setup time: 4 hours

**Recommendation: Vercel**

**Setup:**
```bash
npm i -g vercel
vercel login
vercel link
vercel --prod  # Links to production (clixyspace.com)
vercel         # Creates staging automatically
```

**Environment Structure:**
- Production: main branch → clixyspace.com (TENANT=olga)
- Staging: develop branch → staging.clixy.studio (TENANT=generic)
- PR Previews: feature branches → pr-123.vercel.app

---

### Phase 3: Producer Demo Polish (Week 4)

**Goal:** Create compelling demo account for producer pitches

**Demo Data Creation:**
1. **Shoot 1:** Brand Campaign (completed, with final photos)
2. **Shoot 2:** Personal Portrait (in_progress, editing phase)
3. **Shoot 3:** Video Project (pending, pre-production)
4. **Shoot 4:** Hybrid Shoot (delivered, full workflow shown)
5. **Shoot 5:** Today's Shoot (shows real-time coordination)

**Data Requirements Per Shoot:**
- Realistic client names (not "Test Client")
- Beautiful moodboard images (use Unsplash)
- Complete timeline (4-6 events)
- Full team roster (photographer, stylist, MUA, 2 models)
- Realistic locations (actual addresses with Google Maps)
- Document links (call sheets, moodboards)
- Different statuses to show workflow

**Admin Dashboard Requirements:**
- Shows 10+ shoots (looks "busy" like real producer)
- Mix of upcoming and past shoots
- Various statuses represented
- Quick status toggle working smoothly
- Search functionality demonstrated
- Duplicate shoot feature shown

**Video Demo Script (2-3 min):**
1. **Intro (10s):** "This is Clixy, the shoot coordination platform for producers"
2. **Problem (20s):** Screen recording of messy email inbox
3. **Solution (90s):** Live demo of Clixy workflow
4. **Client View (30s):** Beautiful client portal
5. **ROI (20s):** Time/cost savings calculation
6. **CTA (10s):** "Let's talk about your coordination challenges"

---

## FAQ for Future Development

### "Will refactoring break Olga's site?"
**No.** The refactor extracts hard-coded values into configuration. The "olga" tenant config preserves all current branding and behavior. Users will see zero difference.

### "Can we develop Olga features and producer features in parallel?"
**Yes.** Use feature flags per tenant:
```typescript
if (config.features.giftCards) {
  // Olga-only feature
}
```

### "Do we need to maintain multiple repositories?"
**No.** Single repository with tenant configuration is far superior. Multiple repos = maintenance nightmare.

### "What if a client wants custom features?"
**Two approaches:**
1. Feature flags (preferred): `config.features.customFeatureName`
2. Tenant-specific code: `if (config.id === 'clientname') { ... }`

### "How do we add a new tenant?"
```typescript
// config/tenants.ts
export const tenants = {
  // ... existing tenants
  newclient: {
    id: 'newclient',
    studioName: 'New Client Studios',
    logo: '/logos/newclient.png',
    primaryColor: '#2A5599',
    features: { ... }
  }
}
```
Deploy with `TENANT=newclient`

### "Should we open-source the core?"
**Not yet.** Wait until:
1. 10+ paying customers (proven business model)
2. Multi-tenant architecture stable
3. Can afford to support community
4. Want to build ecosystem/plugins

### "What about mobile app?"
**Phase 1:** Responsive web (covers 80% of use cases)
**Phase 2:** Consider mobile app when:
- 50+ paying customers
- Specific mobile-only features identified
- Revenue justifies development cost

### "When to add team/collaboration features?"
**Trigger:** When 3+ producers request it
**Priority:** After multi-tenant refactor complete
**Complexity:** Medium (user roles, permissions, activity log)

---

## Decision Log

### Decision: Multi-Tenant Architecture (2025-12-30)
**Context:** Need to pitch to producers without Olga-specific branding
**Options Considered:**
1. Fork repository and maintain separately
2. Multi-tenant single codebase
3. Monorepo with separate packages

**Decision:** Multi-tenant single codebase
**Reasoning:**
- Avoids code duplication nightmare
- Scales to 100+ clients
- Bug fixes apply automatically
- Manageable complexity

**Status:** Approved, ready to implement

---

### Decision: Vercel for Staging (2025-12-30)
**Context:** Need staging environment before producer demos
**Options Considered:**
1. Vercel
2. Netlify
3. GitHub Pages + Actions

**Decision:** Vercel
**Reasoning:**
- Automatic preview deploys
- Free tier sufficient
- Fast setup (1 hour)
- Good developer experience

**Status:** Planned for Week 3

---

### Decision: Producer-First Positioning (2025-12-30)
**Context:** Who to target for initial market
**Options Considered:**
1. Individual photographers ($29/mo)
2. Producers ($99-299/mo)
3. Photography studios ($499/mo)

**Decision:** Producers as primary target
**Reasoning:**
- 10x more shoots = 10x value
- Higher budget ($99-299 vs $29)
- Critical business need (not nice-to-have)
- Better ROI story ($1,750 saved vs $99 cost)

**Status:** Approved, pitch strategy defined

---

## Next Actions (Immediate)

**This Week:**
1. ✅ Document strategic context (this file)
2. [ ] Create `config/tenants.ts` structure
3. [ ] Start multi-tenant refactor in feature branch

**Next Week:**
1. [ ] Complete multi-tenant refactor
2. [ ] Test both tenants (olga + generic)
3. [ ] Deploy generic to staging

**Next Month:**
1. [ ] Create producer demo data
2. [ ] Record demo video
3. [ ] Schedule 5 producer calls
4. [ ] First pilot customer

---

## References

**Related Documentation:**
- [Product Roadmap](PRODUCT_ROADMAP.md) - Long-term vision and 18-month plan
- [Development Best Practices](DEVELOPMENT_BEST_PRACTICES.md) - How to avoid breaking production
- [Security Fixes Guide](SECURITY_FIXES_GUIDE.md) - Token system and PIN protection

**External Resources:**
- [Multi-Tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/multi-tenancy)
- [Feature Flags Best Practices](https://www.martinfowler.com/articles/feature-toggles.html)
- [SaaS Pricing Strategy](https://www.priceintelligently.com/blog/saas-pricing-strategy)

---

**Maintainer:** Maksym Sudarikov
**Last Reviewed:** 2025-12-30
**Next Review:** When starting multi-tenant implementation
**Update Frequency:** After major strategic decisions or architecture changes
