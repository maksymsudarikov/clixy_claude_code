# 🚀 CLIXY - Product Roadmap & Strategic Vision

**Version:** 1.0
**Date:** 2025-12-29
**Prepared by:** Senior PM + Developer Analysis
**Timeline:** 18-month transformation roadmap

---

## 📊 EXECUTIVE SUMMARY

**Current State:** Internal photo shoot management portal (Rating: 7/10)
**Target State:** The "Notion for photographers" - Category-defining SaaS platform (Rating: 9.5/10)
**Revenue Potential:** $0 → $1M+ ARR in 18-24 months

**Core Thesis:** Transform from internal tool to multi-tenant SaaS platform with AI-powered features and network effects that create sustainable competitive advantages.

---

## 🎯 STRATEGIC POSITIONING

### Where We Are
- **Product:** Internal portal for Studio Olga Prudka
- **Users:** 1 studio team
- **Revenue:** $0
- **Differentiation:** Clean brutalist design, token-based security
- **Value:** Operational efficiency for one team

### Where We're Going
- **Product:** Multi-tenant SaaS platform for professional photographers
- **Users:** 1,000+ photographers in 18 months
- **Revenue:** $250K-1M ARR
- **Differentiation:** AI curation + magical client experience + team network
- **Value:** Complete operating system for photography businesses

### Market Position
**"The Notion for photographers"**

Why this works:
- Notion proved creative professionals pay for better tools
- Photography market is underserved (mostly spreadsheets + WhatsApp)
- High willingness to pay ($1K-5K per shoot = can afford tools)
- Network effects (teams, locations, clients create lock-in)
- Multiple revenue streams (SaaS + marketplace + fulfillment)

---

## 🗓️ 18-MONTH ROADMAP OVERVIEW

```
PHASE 1 (Months 1-3): Operational Excellence
├── Quick Wins: Keyboard shortcuts, bulk ops, form fixes
├── Focus: Team productivity 3x
└── Status: Foundation strengthening

PHASE 2 (Months 4-6): Intelligence Layer
├── AI-powered photo curation
├── Smart asset tagging
├── Predictive shoot assistant
└── Status: Differentiation building

PHASE 3 (Months 7-9): Client Experience Revolution
├── Magic link galleries
├── Real-time collaboration
├── Client portal dashboard
└── Status: Viral growth engine

PHASE 4 (Months 10-12): Business Growth Engine
├── Marketplace mode (SaaS launch)
├── Print fulfillment integration
├── Business intelligence analytics
└── Status: Revenue generation

PHASE 5 (Months 13-18): Ecosystem & Network Effects
├── Team network (LinkedIn for photo crews)
├── Location database
├── AI shot list generator
└── Status: Moat building
```

---

## 📅 DETAILED PHASE BREAKDOWN

---

## PHASE 1: OPERATIONAL EXCELLENCE (Months 1-3)

**Goal:** Solve immediate team pain points, establish foundation for scale

### Sprint 1: Quick Wins (Week 1-2)

#### 1.1 Keyboard Shortcuts ⚡
**Effort:** 4 hours | **Impact:** High

**Features:**
- `N` - New shoot
- `Cmd+F` - Focus search
- `Del` - Delete selected shoot
- `E` - Edit selected shoot
- `Esc` - Close modals
- `Cmd+S` - Save form
- `Arrow Keys` - Navigate table

**Implementation:**
```typescript
// hooks/useKeyboardShortcuts.ts
export function useKeyboardShortcuts(handlers: KeyHandlers) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if typing in input
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === 'n' && !e.metaKey) handlers.onNew();
      if (e.key === 'f' && e.metaKey) {
        e.preventDefault();
        handlers.onSearch();
      }
      if (e.key === 'Delete') handlers.onDelete();
      if (e.key === 'e' && !e.metaKey) handlers.onEdit();
      if (e.key === 'Escape') handlers.onClose();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlers]);
}
```

**Success Metrics:**
- Power users 2-3x faster
- Average actions per session +40%
- User satisfaction +25%

---

#### 1.2 Duplicate Shoot Button 🔄
**Effort:** 2 hours | **Impact:** Medium-High

**Use Cases:**
- Recurring clients (same location, similar setup)
- Multi-day shoots (day 1 → day 2)
- Template shoots (standard editorial setup)

**Implementation:**
```typescript
const handleDuplicate = async (shoot: Shoot) => {
  const newShoot: Shoot = {
    ...shoot,
    id: generateId(),
    accessToken: generateSecureToken(),
    title: `${shoot.title} (Copy)`,
    status: 'draft',
    date: new Date().toISOString(),
    deliveryDate: null,
    photoStatus: 'not_started',
  };

  await createShoot(newShoot);
  showToast('Shoot duplicated! Edit details as needed.', 'success');
  navigate(`/admin/edit/${newShoot.id}`);
};
```

**UI Location:** Dashboard table row actions menu

---

#### 1.3 Quick Status Toggle 🎛️
**Effort:** 2 hours | **Impact:** Medium

**Current Flow:** Click shoot → Edit form → Change status → Save (5 clicks)
**New Flow:** Click status badge → Select from dropdown → Auto-save (1 click)

**Implementation:**
```typescript
// components/StatusBadge.tsx
const StatusBadge = ({ status, shootId, onChange }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (newStatus: PhotoStatus) => {
    setIsUpdating(true);
    try {
      await updateShootStatus(shootId, newStatus);
      onChange(newStatus);
      showToast('Status updated', 'success');
    } catch (error) {
      showToast('Failed to update status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isUpdating}
      className="status-badge-select"
    >
      <option value="not_started">Not Started</option>
      <option value="selection_ready">Selection Ready</option>
      <option value="editing">Editing</option>
      <option value="completed">Completed</option>
    </select>
  );
};
```

---

#### 1.4 Better Delete Confirmation ⚠️
**Effort:** 2 hours | **Impact:** Low-Medium

**Problem:** Generic "Are you sure?" allows accidental deletions

**Solution:** Show shoot details, require typing "DELETE"

**Implementation:**
```typescript
// components/DeleteConfirmationModal.tsx
const DeleteConfirmationModal = ({ shoot, onConfirm, onCancel }) => {
  const [confirmText, setConfirmText] = useState('');
  const isValid = confirmText === 'DELETE';

  return (
    <Modal onClose={onCancel}>
      <h2>Delete Shoot</h2>
      <div className="warning-box">
        <p>You're about to permanently delete:</p>
        <div className="shoot-details">
          <strong>{shoot.title}</strong>
          <span>{shoot.client}</span>
          <span>{formatDate(shoot.date)}</span>
          <span>{shoot.team.length} team members</span>
        </div>
      </div>

      <p>Type <code>DELETE</code> to confirm:</p>
      <input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="DELETE"
        autoFocus
      />

      <div className="actions">
        <button onClick={onCancel}>Cancel</button>
        <button
          onClick={onConfirm}
          disabled={!isValid}
          className="danger"
        >
          Delete Permanently
        </button>
      </div>
    </Modal>
  );
};
```

---

#### 1.5 Error Boundary Component 🛡️
**Effort:** 2 hours | **Impact:** High (Production stability)

**Implementation:**
```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Sentry or error tracking service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <h1>Something went wrong</h1>
          <p>We've been notified and are looking into it.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Usage:** Wrap entire App and each major route

---

#### 1.6 Loading States ⏳
**Effort:** 3 hours | **Impact:** Medium

**Problem:** No feedback during async operations → users click multiple times

**Solution:** Proper loading indicators everywhere

**Implementation:**
```typescript
// Use React Query for automatic loading states
import { useMutation, useQuery } from '@tanstack/react-query';

const { mutate: createShoot, isLoading } = useMutation({
  mutationFn: createShootAPI,
  onSuccess: () => {
    showToast('Shoot created!', 'success');
    navigate('/dashboard');
  },
  onError: () => {
    showToast('Failed to create shoot', 'error');
  }
});

<button disabled={isLoading}>
  {isLoading ? (
    <>
      <Spinner /> Creating...
    </>
  ) : (
    'Create Shoot'
  )}
</button>
```

---

### Sprint 2: Form Improvements (Week 3-4)

#### 2.1 Multi-Step Form Wizard 🧙‍♂️
**Effort:** 10 hours | **Impact:** High (Solves #1 pain point)

**Problem:** 650-line form causes "form paralysis"

**Solution:** Break into 3 progressive steps

**Step 1: Quick Info** (Creates draft immediately)
- Title
- Client
- Date + time
- Project type

**Step 2: Details** (Optional, can skip and return later)
- Location (name, address, map)
- Description
- Team members
- Timeline
- Payment info

**Step 3: Media** (Optional)
- Moodboard images
- Cover image
- Styling references

**Implementation:**
```typescript
// components/ShootFormWizard.tsx
const ShootFormWizard = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Shoot>>({});

  const saveStep = async (stepData: Partial<Shoot>) => {
    const updatedData = { ...formData, ...stepData };
    setFormData(updatedData);

    // Auto-save after each step
    if (formData.id) {
      await updateShoot(formData.id, updatedData);
    } else {
      const newShoot = await createShoot(updatedData);
      setFormData({ ...updatedData, id: newShoot.id });
    }
  };

  return (
    <div className="wizard">
      <StepIndicator current={step} total={3} />

      {step === 1 && (
        <Step1QuickInfo
          data={formData}
          onNext={(data) => {
            saveStep(data);
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <Step2Details
          data={formData}
          onNext={(data) => {
            saveStep(data);
            setStep(3);
          }}
          onSkip={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <Step3Media
          data={formData}
          onFinish={async (data) => {
            await saveStep(data);
            navigate('/dashboard');
          }}
          onSkip={() => navigate('/dashboard')}
        />
      )}
    </div>
  );
};
```

**Success Metrics:**
- Form completion time: 5 min → 2 min (-60%)
- Completion rate: 85% → 98%
- User satisfaction: +50%

---

#### 2.2 Real-time Form Validation ✅
**Effort:** 8 hours | **Impact:** Medium

**Current:** Errors shown only after submit
**Better:** Instant feedback as user types

**Implementation:**
```typescript
// Use React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const step1Schema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title too long'),
  client: z.string()
    .min(2, 'Client name required'),
  date: z.string()
    .refine(val => !isNaN(Date.parse(val)), 'Invalid date')
    .refine(val => new Date(val) >= new Date(), 'Date must be in future'),
  projectType: z.enum(['photo_shoot', 'video_project', 'hybrid']),
});

const form = useForm({
  resolver: zodResolver(step1Schema),
  mode: 'onChange', // Validate on every change
});

// In render
<input
  {...form.register('title')}
  className={form.formState.errors.title ? 'error' : ''}
/>
{form.formState.errors.title && (
  <span className="error-message">
    {form.formState.errors.title.message}
  </span>
)}
```

---

### Sprint 3: Search & Bulk Operations (Week 5-6)

#### 3.1 Advanced Search & Filters 🔍
**Effort:** 12 hours | **Impact:** High

**Current:** Only searches `title` and `client` fields
**New:** Comprehensive filtering system

**Filter Panel:**
```typescript
interface ShootFilters {
  // Search
  searchQuery?: string; // Title, client, location

  // Date filters
  dateFrom?: string;
  dateTo?: string;

  // Status filters
  status?: PhotoStatus[]; // Multi-select

  // Type filters
  projectType?: ProjectType[]; // Multi-select

  // Location
  location?: string; // Location name search

  // Sorting
  sortBy?: 'date' | 'client' | 'status' | 'created';
  sortDirection?: 'asc' | 'desc';
}
```

**Implementation:**
```typescript
// components/ShootFilters.tsx
const ShootFilters = ({ filters, onChange }) => {
  return (
    <div className="filters-panel">
      <SearchInput
        value={filters.searchQuery}
        onChange={(q) => onChange({ ...filters, searchQuery: q })}
        placeholder="Search title, client, location..."
      />

      <DateRangePicker
        from={filters.dateFrom}
        to={filters.dateTo}
        onChange={(from, to) => onChange({ ...filters, dateFrom: from, dateTo: to })}
      />

      <MultiSelect
        label="Status"
        options={photoStatuses}
        selected={filters.status}
        onChange={(status) => onChange({ ...filters, status })}
      />

      <MultiSelect
        label="Project Type"
        options={projectTypes}
        selected={filters.projectType}
        onChange={(projectType) => onChange({ ...filters, projectType })}
      />

      <SortDropdown
        value={filters.sortBy}
        onChange={(sortBy) => onChange({ ...filters, sortBy })}
      />
    </div>
  );
};

// Filter logic
const filteredShoots = useMemo(() => {
  let result = shoots;

  // Search query
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.client.toLowerCase().includes(q) ||
      s.locationName?.toLowerCase().includes(q)
    );
  }

  // Date range
  if (filters.dateFrom) {
    result = result.filter(s => s.date >= filters.dateFrom);
  }
  if (filters.dateTo) {
    result = result.filter(s => s.date <= filters.dateTo);
  }

  // Status
  if (filters.status?.length) {
    result = result.filter(s => filters.status.includes(s.photoStatus));
  }

  // Project type
  if (filters.projectType?.length) {
    result = result.filter(s => filters.projectType.includes(s.projectType));
  }

  // Sort
  result.sort((a, b) => {
    const direction = filters.sortDirection === 'desc' ? -1 : 1;
    if (filters.sortBy === 'date') {
      return direction * (new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    // ... other sorts
    return 0;
  });

  return result;
}, [shoots, filters]);
```

**UI:** Collapsible filter sidebar with "Clear All" button

---

#### 3.2 Bulk Operations 📦
**Effort:** 10 hours | **Impact:** High

**Features:**
- Multi-select checkbox column
- Bulk action toolbar
- Bulk delete
- Bulk status update
- Bulk export

**Implementation:**
```typescript
// AdminDashboard.tsx
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

const toggleSelect = (id: string) => {
  const newSelected = new Set(selectedIds);
  if (newSelected.has(id)) {
    newSelected.delete(id);
  } else {
    newSelected.add(id);
  }
  setSelectedIds(newSelected);
};

const selectAll = () => {
  setSelectedIds(new Set(filteredShoots.map(s => s.id)));
};

const deselectAll = () => {
  setSelectedIds(new Set());
};

const handleBulkDelete = async () => {
  if (!confirm(`Delete ${selectedIds.size} shoots permanently?`)) return;

  await Promise.all(
    Array.from(selectedIds).map(id => deleteShoot(id))
  );

  showToast(`${selectedIds.size} shoots deleted`, 'success');
  setSelectedIds(new Set());
};

const handleBulkStatusUpdate = async (newStatus: PhotoStatus) => {
  await Promise.all(
    Array.from(selectedIds).map(id => updateShootStatus(id, newStatus))
  );

  showToast(`${selectedIds.size} shoots updated`, 'success');
  setSelectedIds(new Set());
};

// UI
return (
  <>
    {selectedIds.size > 0 && (
      <BulkActionBar>
        <span>{selectedIds.size} selected</span>
        <button onClick={deselectAll}>Deselect All</button>
        <button onClick={handleBulkDelete} className="danger">
          Delete
        </button>
        <StatusDropdown onChange={handleBulkStatusUpdate} />
        <button onClick={() => exportShoots(Array.from(selectedIds))}>
          Export
        </button>
      </BulkActionBar>
    )}

    <table>
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              checked={selectedIds.size === filteredShoots.length}
              onChange={(e) => e.target.checked ? selectAll() : deselectAll()}
            />
          </th>
          <th>Title</th>
          {/* ... */}
        </tr>
      </thead>
      <tbody>
        {filteredShoots.map(shoot => (
          <tr key={shoot.id}>
            <td>
              <input
                type="checkbox"
                checked={selectedIds.has(shoot.id)}
                onChange={() => toggleSelect(shoot.id)}
              />
            </td>
            {/* ... */}
          </tr>
        ))}
      </tbody>
    </table>
  </>
);
```

---

#### 3.3 WhatsApp Share Integration 💬
**Effort:** 6 hours | **Impact:** Medium

**Current Flow:** Copy link → Open WhatsApp → Paste (3 steps)
**New Flow:** Click WhatsApp button → Opens with pre-filled message (1 click)

**Implementation:**
```typescript
const handleWhatsAppShare = (shoot: Shoot) => {
  const url = `${window.location.origin}/#/shoot/${shoot.id}?token=${shoot.accessToken}`;
  const message = `Hi! Here's your photo shoot gallery: "${shoot.title}"\n\n${url}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, '_blank');
  showToast('Opening WhatsApp...', 'info');
};

// UI - Add to action menu
<button onClick={() => handleWhatsAppShare(shoot)}>
  <WhatsAppIcon />
  Share via WhatsApp
</button>
```

**Alternative:** Add phone number input for direct message
```typescript
const handleWhatsAppDirect = (shoot: Shoot, phoneNumber: string) => {
  // Format: +1234567890 (remove all non-digits)
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const url = `${window.location.origin}/#/shoot/${shoot.id}?token=${shoot.accessToken}`;
  const message = `Hi! Here's your photo shoot gallery: "${shoot.title}"\n\n${url}`;
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, '_blank');
};
```

---

### Phase 1 Summary

**Timeline:** Months 1-3
**Total Effort:** ~55 hours (1-2 sprints for solo dev)
**Expected Impact:**
- Team productivity: +200% (3x faster)
- Form completion time: -60%
- Search time: -80%
- Bulk operations: Save 5-10 min/day
- User satisfaction: +50%

**Deliverables:**
- ✅ 6 quick wins implemented
- ✅ Multi-step form wizard
- ✅ Advanced search & filters
- ✅ Bulk operations system
- ✅ WhatsApp integration

**Success Criteria:**
- Internal team reports significant productivity gains
- No critical bugs in production
- Foundation ready for external users (multi-tenancy)

---

## PHASE 2: INTELLIGENCE LAYER (Months 4-6)

**Goal:** Add AI-powered features that differentiate from all competitors

---

### 2.1 AI-Powered Photo Curation 🤖

**Effort:** 3 weeks | **Impact:** Very High

**Problem:** Photographers spend 4-6 hours selecting best 50 photos from 500+ shots

**Solution:** AI scores photos, auto-generates curated galleries

#### Technical Architecture

**Stack:**
- **Option A:** Replicate + CLIP model (open source, cost-effective)
- **Option B:** Azure Computer Vision (enterprise, reliable)
- **Option C:** Google Cloud Vision AI (good balance)

**Recommended:** Google Cloud Vision AI
- $1.50 per 1,000 images (affordable)
- Quality scoring built-in
- Face detection included
- 99.9% uptime SLA

#### Implementation

**Step 1: Photo Upload & Analysis**
```typescript
// services/aiCurationService.ts
import vision from '@google-cloud/vision';

interface PhotoScore {
  url: string;
  scores: {
    technical: number; // 0-100 (sharpness, exposure, composition)
    emotional: number; // 0-100 (facial expressions, energy)
    aesthetics: number; // 0-100 (color harmony, balance)
    overall: number; // Weighted average
  };
  tags: string[];
  faces: number;
  issues?: string[]; // e.g., "overexposed", "motion blur"
}

export async function analyzePhoto(imageUrl: string): Promise<PhotoScore> {
  const client = new vision.ImageAnnotatorClient();

  const [result] = await client.annotateImage({
    image: { source: { imageUri: imageUrl } },
    features: [
      { type: 'FACE_DETECTION' },
      { type: 'LABEL_DETECTION' },
      { type: 'IMAGE_PROPERTIES' },
      { type: 'SAFE_SEARCH_DETECTION' },
    ],
  });

  // Calculate scores
  const technical = calculateTechnicalScore(result);
  const emotional = calculateEmotionalScore(result);
  const aesthetics = calculateAestheticScore(result);

  return {
    url: imageUrl,
    scores: {
      technical,
      emotional,
      aesthetics,
      overall: (technical * 0.3 + emotional * 0.4 + aesthetics * 0.3),
    },
    tags: result.labelAnnotations?.map(l => l.description) || [],
    faces: result.faceAnnotations?.length || 0,
    issues: detectIssues(result),
  };
}

function calculateTechnicalScore(result): number {
  // Sharpness, exposure, composition analysis
  let score = 100;

  // Check image properties
  const props = result.imagePropertiesAnnotation;
  if (props) {
    // Analyze color dominance (prefer balanced palettes)
    const colorBalance = analyzeColorBalance(props.dominantColors);
    score *= colorBalance;
  }

  // Check for technical issues
  if (result.safeSearchAnnotation) {
    // Penalize if likely screenshot or graphic
    // (photographers want real photos prioritized)
  }

  return Math.round(score);
}

function calculateEmotionalScore(result): number {
  // Face detection + expression analysis
  const faces = result.faceAnnotations || [];
  if (faces.length === 0) return 50; // Neutral if no faces

  let emotionalScore = 0;
  faces.forEach(face => {
    // Google Vision provides likelihood ratings
    const joyLevel = getLikelihoodValue(face.joyLikelihood);
    const sorrowLevel = getLikelihoodValue(face.sorrowLikelihood);

    // Positive emotions score higher
    emotionalScore += joyLevel * 100;

    // Eye contact with camera
    const eyeContactScore = analyzeGaze(face);
    emotionalScore += eyeContactScore;
  });

  return Math.round(emotionalScore / faces.length);
}

function calculateAestheticScore(result): number {
  // Color harmony, rule of thirds, leading lines
  const props = result.imagePropertiesAnnotation;

  let score = 50; // Base score

  // Color harmony (complementary colors score higher)
  const colorHarmony = analyzeColorHarmony(props?.dominantColors);
  score += colorHarmony * 50;

  return Math.round(Math.min(100, score));
}
```

**Step 2: Auto-Generate Gallery**
```typescript
export async function generateCuratedGallery(
  photos: string[],
  targetCount: number = 50,
  preferences?: CurationPreferences
): Promise<CuratedGallery> {

  // 1. Analyze all photos in parallel
  const analyses = await Promise.all(
    photos.map(url => analyzePhoto(url))
  );

  // 2. Sort by overall score
  analyses.sort((a, b) => b.scores.overall - a.scores.overall);

  // 3. Apply diversity filters
  const curated = applyDiversityRules(analyses, targetCount, preferences);

  // 4. Group into categories
  const categories = {
    highlights: curated.slice(0, 10), // Best of the best
    portraits: curated.filter(p => p.faces > 0),
    landscapes: curated.filter(p => p.faces === 0 && p.tags.includes('landscape')),
    details: curated.filter(p => p.tags.includes('close-up')),
  };

  return {
    photos: curated.map(p => p.url),
    categories,
    metadata: {
      totalAnalyzed: photos.length,
      selected: curated.length,
      averageScore: curated.reduce((sum, p) => sum + p.scores.overall, 0) / curated.length,
      processingTime: '45s', // Track this
    },
  };
}

function applyDiversityRules(
  photos: PhotoScore[],
  targetCount: number,
  prefs?: CurationPreferences
): PhotoScore[] {
  const selected: PhotoScore[] = [];
  const used = new Set<string>();

  // Ensure variety
  for (const photo of photos) {
    if (selected.length >= targetCount) break;

    // Skip if too similar to already selected
    if (isTooSimilar(photo, selected)) continue;

    // Apply user preferences
    if (prefs?.minFaces && photo.faces < prefs.minFaces) continue;
    if (prefs?.excludeTags?.some(tag => photo.tags.includes(tag))) continue;

    selected.push(photo);
  }

  return selected;
}
```

**Step 3: UI Integration**
```typescript
// components/CurationAssistant.tsx
const CurationAssistant = ({ shootId }) => {
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [gallery, setGallery] = useState<CuratedGallery | null>(null);

  const handleAutoCurate = async () => {
    setStatus('analyzing');

    try {
      const shoot = await fetchShoot(shootId);
      const photos = shoot.allPhotos; // Array of URLs

      const curated = await generateCuratedGallery(photos, 50);
      setGallery(curated);
      setStatus('done');

      showToast(`Selected ${curated.photos.length} best photos from ${photos.length}`, 'success');
    } catch (error) {
      showToast('Failed to analyze photos', 'error');
      setStatus('idle');
    }
  };

  return (
    <div className="curation-assistant">
      {status === 'idle' && (
        <button onClick={handleAutoCurate} className="ai-button">
          ✨ Auto-Curate with AI
        </button>
      )}

      {status === 'analyzing' && (
        <div className="analyzing">
          <Spinner />
          <p>Analyzing {shoot.allPhotos.length} photos...</p>
          <p className="hint">This takes about 1 minute</p>
        </div>
      )}

      {status === 'done' && gallery && (
        <div className="results">
          <h3>✨ AI-Curated Gallery Ready</h3>
          <p>Selected {gallery.photos.length} photos (avg score: {gallery.metadata.averageScore.toFixed(1)}/100)</p>

          <div className="preview-grid">
            {gallery.categories.highlights.map(photo => (
              <img key={photo.url} src={photo.url} alt="" />
            ))}
          </div>

          <div className="actions">
            <button onClick={() => applyGallery(gallery)}>
              Apply This Selection
            </button>
            <button onClick={handleAutoCurate} className="secondary">
              Re-analyze
            </button>
            <button onClick={() => setStatus('idle')} className="secondary">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

#### Pricing

**Cost Analysis:**
- Google Cloud Vision: $1.50 per 1,000 images
- Average shoot: 500 photos to analyze
- Cost per curation: $0.75
- Photographer saves: 4-6 hours ($200-400 value)
- **ROI: 266x-533x**

**Pricing for Customers:**
- Include free in Pro tier ($49/mo) - Up to 10 curations/month
- Studio tier ($149/mo) - Unlimited curations
- Add-on: $5 per curation (for free tier users)

#### Success Metrics

- **Time saved:** 4-6 hours → 30 minutes (90% reduction)
- **Accuracy:** 85%+ of AI selections match photographer's manual picks
- **Adoption:** 60%+ of Pro users try AI curation
- **Retention:** Users who use AI curation have 2x higher retention

---

### 2.2 Smart Asset Tagging 🏷️

**Effort:** 2 weeks | **Impact:** High

**Problem:** Finding photos later ("that blue dress shot from last summer") is impossible

**Solution:** Auto-tag every photo on upload

#### Implementation

```typescript
// services/autoTaggingService.ts
interface PhotoTags {
  objects: string[]; // "blue dress", "sunset", "urban background"
  people: string[]; // Face recognition (with consent)
  mood: string[]; // "energetic", "moody", "romantic"
  technical: string[]; // "bokeh", "wide angle", "natural light"
  colors: string[]; // Dominant colors
  location?: string; // If GPS data available
}

export async function autoTagPhoto(imageUrl: string): Promise<PhotoTags> {
  const client = new vision.ImageAnnotatorClient();

  const [result] = await client.annotateImage({
    image: { source: { imageUri: imageUrl } },
    features: [
      { type: 'LABEL_DETECTION', maxResults: 20 },
      { type: 'FACE_DETECTION' },
      { type: 'IMAGE_PROPERTIES' },
      { type: 'LANDMARK_DETECTION' },
    ],
  });

  return {
    objects: extractObjects(result.labelAnnotations),
    people: extractPeople(result.faceAnnotations),
    mood: inferMood(result),
    technical: analyzeTechnical(result),
    colors: extractColors(result.imagePropertiesAnnotation),
    location: result.landmarkAnnotations?.[0]?.description,
  };
}

// Search implementation
export function searchPhotos(query: string, allPhotos: Photo[]): Photo[] {
  const queryLower = query.toLowerCase();

  return allPhotos.filter(photo => {
    // Search in all tag categories
    const allTags = [
      ...photo.tags.objects,
      ...photo.tags.people,
      ...photo.tags.mood,
      ...photo.tags.technical,
      ...photo.tags.colors,
    ].map(t => t.toLowerCase());

    return allTags.some(tag => tag.includes(queryLower)) ||
           photo.tags.location?.toLowerCase().includes(queryLower);
  });
}
```

**UI: Smart Search Bar**
```typescript
// components/SmartPhotoSearch.tsx
const SmartPhotoSearch = ({ shootId }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Photo[]>([]);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length < 2) return;

    const shoot = await fetchShoot(shootId);
    const filtered = searchPhotos(q, shoot.photos);
    setResults(filtered);
  };

  return (
    <div className="smart-search">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search: 'blue dress sunset', 'moody portrait', 'natural light'..."
      />

      {results.length > 0 && (
        <div className="results">
          <p>{results.length} photos found</p>
          <PhotoGrid photos={results} />
        </div>
      )}
    </div>
  );
};
```

---

### 2.3 Predictive Shoot Assistant 📅

**Effort:** 2 weeks | **Impact:** Medium-High

**Problem:** Planning shoots requires juggling weather, team availability, locations, permits

**Solution:** AI suggests optimal shoot dates/times

#### Data Sources

1. **Weather API** - OpenWeatherMap or Weather.com
2. **Team Availability** - Synced calendars (Google Calendar API)
3. **Historical Data** - Past shoots (what worked well)
4. **Location Data** - Crowd patterns, permit calendars

#### Implementation

```typescript
// services/shootPlanningService.ts
interface ShootSuggestion {
  date: string;
  timeSlot: { start: string; end: string };
  score: number; // 0-100
  reasons: string[];
  weather: {
    condition: string;
    temp: number;
    windSpeed: number;
    goldenHour: { start: string; end: string };
  };
  teamAvailability: {
    available: number;
    total: number;
    missing: string[];
  };
}

export async function getSuggestedShootDates(
  requirements: ShootRequirements
): Promise<ShootSuggestion[]> {

  const suggestions: ShootSuggestion[] = [];

  // Check next 30 days
  for (let i = 0; i < 30; i++) {
    const date = addDays(new Date(), i);

    // Get weather forecast
    const weather = await fetchWeather(requirements.location, date);

    // Get team availability
    const availability = await checkTeamAvailability(requirements.team, date);

    // Calculate score
    const score = calculateShootScore(weather, availability, requirements);

    if (score > 60) { // Only suggest good options
      suggestions.push({
        date: date.toISOString(),
        timeSlot: calculateOptimalTime(weather, requirements),
        score,
        reasons: generateReasons(weather, availability, requirements),
        weather,
        teamAvailability: availability,
      });
    }
  }

  // Sort by score
  return suggestions.sort((a, b) => b.score - a.score).slice(0, 5);
}

function calculateShootScore(
  weather: WeatherData,
  availability: TeamAvailability,
  requirements: ShootRequirements
): number {
  let score = 100;

  // Weather penalties
  if (weather.condition === 'rain') score -= 40;
  if (weather.condition === 'clouds' && requirements.needsSunlight) score -= 20;
  if (weather.windSpeed > 15) score -= 15; // mph
  if (weather.temp < 40 || weather.temp > 90) score -= 10; // F

  // Team availability
  const availabilityPct = availability.available / availability.total;
  score *= availabilityPct;

  // Golden hour bonus (if required)
  if (requirements.goldenHour && weather.goldenHour) {
    score += 10;
  }

  // Weekend bonus (if preferred)
  const isWeekend = [0, 6].includes(new Date(date).getDay());
  if (requirements.preferWeekend && isWeekend) score += 5;

  return Math.round(Math.max(0, Math.min(100, score)));
}

function generateReasons(weather, availability, requirements): string[] {
  const reasons = [];

  if (weather.condition === 'clear') {
    reasons.push('☀️ Clear weather forecasted');
  }

  if (weather.goldenHour) {
    reasons.push(`🌅 Golden hour: ${formatTime(weather.goldenHour.start)} - ${formatTime(weather.goldenHour.end)}`);
  }

  if (availability.available === availability.total) {
    reasons.push('✅ All team members available');
  } else {
    reasons.push(`⚠️ ${availability.available}/${availability.total} team available (missing: ${availability.missing.join(', ')})`);
  }

  if (weather.windSpeed < 5) {
    reasons.push('💨 Low wind (ideal for outdoor shoots)');
  }

  return reasons;
}
```

**UI Component**
```typescript
// components/ShootPlanner.tsx
const ShootPlanner = () => {
  const [requirements, setRequirements] = useState<ShootRequirements>({
    location: 'Central Park, NYC',
    team: ['photographer', 'stylist', 'model'],
    goldenHour: true,
    preferWeekend: false,
  });

  const [suggestions, setSuggestions] = useState<ShootSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePlan = async () => {
    setLoading(true);
    const results = await getSuggestedShootDates(requirements);
    setSuggestions(results);
    setLoading(false);
  };

  return (
    <div className="shoot-planner">
      <h2>🤖 AI Shoot Planner</h2>

      <form>
        <input
          value={requirements.location}
          onChange={(e) => setRequirements({...requirements, location: e.target.value})}
          placeholder="Location (e.g., Central Park, NYC)"
        />

        <label>
          <input
            type="checkbox"
            checked={requirements.goldenHour}
            onChange={(e) => setRequirements({...requirements, goldenHour: e.target.checked})}
          />
          Must include golden hour
        </label>

        <button onClick={handlePlan} disabled={loading}>
          {loading ? 'Analyzing...' : 'Find Best Dates'}
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="suggestions">
          <h3>Top Suggestions</h3>
          {suggestions.map(sug => (
            <div key={sug.date} className="suggestion-card">
              <div className="score-badge">{sug.score}/100</div>
              <h4>{formatDate(sug.date)}</h4>
              <p className="time-slot">{formatTime(sug.timeSlot.start)} - {formatTime(sug.timeSlot.end)}</p>

              <div className="weather-info">
                <span>{sug.weather.condition}</span>
                <span>{sug.weather.temp}°F</span>
                <span>Wind: {sug.weather.windSpeed}mph</span>
              </div>

              <ul className="reasons">
                {sug.reasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>

              <button onClick={() => scheduleShoot(sug.date, sug.timeSlot)}>
                Schedule This Shoot
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

#### Cost

- **Weather API:** OpenWeatherMap free tier (1,000 calls/day)
- **Calendar API:** Google Calendar API (free)
- **Compute:** Negligible (simple calculations)
- **Total:** ~$0 per suggestion

#### Value

- **Time saved:** 1-2 hours of manual research
- **Better decisions:** Weather-aware scheduling reduces cancellations
- **Team coordination:** Automatic availability checking

---

### Phase 2 Summary

**Timeline:** Months 4-6
**Total Effort:** ~7 weeks (for solo dev)
**Investment:**
- Google Cloud Vision: ~$100/month (for 10K photos analyzed)
- Weather API: Free tier
- Total: ~$1,200 for phase

**Expected ROI:**
- Each AI curation saves 4-6 hours ($200-400 value)
- 50 curations/month = $10K-20K value delivered
- Justifies $99/mo premium tier (vs $49/mo basic)

**Deliverables:**
- ✅ AI photo curation system
- ✅ Smart auto-tagging
- ✅ Predictive shoot planner
- ✅ Search by visual attributes
- ✅ 90% time savings on curation

**Success Criteria:**
- 60%+ of Pro users try AI curation
- 85%+ accuracy vs manual selection
- Users report "magical" experience
- Competitive differentiation established

---

## PHASE 3: CLIENT EXPERIENCE REVOLUTION (Months 7-9)

**Goal:** Transform from internal tool to client-facing platform that creates "wow moments"

---

### 3.1 Magic Link Experience ✨

**Effort:** 3 weeks | **Impact:** Very High

**Current:** Client clicks link → sees basic photo grid
**Vision:** Client clicks link → immersive, personalized, shareable experience

#### Features

**1. Animated Entrance**
```typescript
// components/MagicGalleryEntrance.tsx
const MagicGalleryEntrance = ({ shoot, onEnter }) => {
  useEffect(() => {
    // Fade in sequence
    const timeline = gsap.timeline();
    timeline
      .from('.studio-logo', { opacity: 0, scale: 0.8, duration: 1 })
      .from('.shoot-title', { opacity: 0, y: 20, duration: 0.8 }, '-=0.3')
      .from('.enter-button', { opacity: 0, y: 20, duration: 0.6 }, '-=0.3');
  }, []);

  return (
    <div className="magic-entrance">
      <div className="studio-logo">
        <StudioLogo />
        <p className="tagline">by Studio Olga Prudka®</p>
      </div>

      <h1 className="shoot-title">
        Hi {shoot.client}! Your {shoot.title} is ready 📸
      </h1>

      <button className="enter-button" onClick={onEnter}>
        View Gallery
      </button>
    </div>
  );
};
```

**2. Auto-Playing Slideshow**
```typescript
// components/PhotoSlideshow.tsx
const PhotoSlideshow = ({ photos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [music, setMusic] = useState<string | null>(null);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 3000); // 3 seconds per photo

    return () => clearInterval(interval);
  }, [isPlaying, photos.length]);

  return (
    <div className="slideshow">
      <div className="photo-container">
        <img
          src={photos[currentIndex].url}
          alt=""
          className="fade-in"
        />
      </div>

      <div className="controls">
        <button onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? '⏸ Pause' : '▶️ Play'}
        </button>

        <MusicSelector
          value={music}
          onChange={setMusic}
          options={[
            { label: 'Ambient', value: 'ambient.mp3' },
            { label: 'Upbeat', value: 'upbeat.mp3' },
            { label: 'Cinematic', value: 'cinematic.mp3' },
            { label: 'None', value: null },
          ]}
        />
      </div>

      <div className="progress">
        {currentIndex + 1} / {photos.length}
      </div>
    </div>
  );
};
```

**3. Interactive Features**
```typescript
// components/InteractiveGallery.tsx
const InteractiveGallery = ({ shoot, clientMode = true }) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Map<string, string>>(new Map());

  const toggleFavorite = (photoId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(photoId)) {
      newFavorites.delete(photoId);
    } else {
      newFavorites.add(photoId);
    }
    setFavorites(newFavorites);

    // Save to backend
    saveFavorites(shoot.id, Array.from(newFavorites));
  };

  const addComment = (photoId: string, text: string) => {
    const newComments = new Map(comments);
    newComments.set(photoId, text);
    setComments(newComments);

    // Save to backend
    saveComment(shoot.id, photoId, text);
  };

  return (
    <div className="interactive-gallery">
      <div className="header">
        <h2>{shoot.title}</h2>
        <div className="stats">
          <span>{favorites.size} favorites selected</span>
          <span>{shoot.photos.length} total photos</span>
        </div>
      </div>

      <div className="photo-grid">
        {shoot.photos.map(photo => (
          <div key={photo.id} className="photo-card">
            <img src={photo.url} alt="" />

            <div className="photo-actions">
              <button
                className={`favorite-btn ${favorites.has(photo.id) ? 'active' : ''}`}
                onClick={() => toggleFavorite(photo.id)}
              >
                {favorites.has(photo.id) ? '❤️' : '🤍'}
              </button>

              {clientMode && (
                <button
                  className="comment-btn"
                  onClick={() => openCommentModal(photo.id)}
                >
                  💬 Request Edit
                </button>
              )}

              <button className="download-btn">
                ⬇️
              </button>
            </div>

            {comments.has(photo.id) && (
              <div className="comment">
                "{comments.get(photo.id)}"
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="gallery-footer">
        <button onClick={() => downloadSelected(Array.from(favorites))}>
          Download Selected ({favorites.size})
        </button>
        <button onClick={() => shareGallery(shoot)}>
          Share Gallery
        </button>
      </div>
    </div>
  );
};
```

**4. Social Sharing Optimization**
```typescript
// Add Open Graph meta tags for beautiful link previews
const GalleryMetaTags = ({ shoot }) => {
  return (
    <Helmet>
      <title>{shoot.title} - Studio Olga Prudka</title>
      <meta name="description" content={`View ${shoot.client}'s beautiful photo shoot gallery`} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:title" content={shoot.title} />
      <meta property="og:description" content={`${shoot.photos.length} professional photos by Studio Olga Prudka`} />
      <meta property="og:image" content={shoot.coverImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={window.location.href} />
      <meta property="twitter:title" content={shoot.title} />
      <meta property="twitter:description" content={`${shoot.photos.length} professional photos`} />
      <meta property="twitter:image" content={shoot.coverImage} />
    </Helmet>
  );
};
```

#### Psychological Impact

**Goal:** Make client feel VIP, increase organic sharing

**Tactics:**
1. **Personalization:** "Hi Emma!" creates connection
2. **Anticipation:** Animated entrance builds excitement
3. **Delight:** Auto-playing slideshow is unexpected joy
4. **Control:** Music selection, slideshow controls
5. **Shareability:** Beautiful link previews → organic marketing

**Expected Outcomes:**
- 20-30% higher client engagement
- 40%+ share their gallery on social media
- "Look at this amazing gallery my photographer sent!" → free marketing
- Higher rebooking rate (memorable experience)

---

### 3.2 Real-Time Collaboration 👥

**Effort:** 2 weeks | **Impact:** High

**Problem:** Client selections happen via WhatsApp: "I like #34, #56, #72..."
**Solution:** Live collaboration with instant notifications

#### Technical Stack

**Supabase Realtime** (already using Supabase)
- WebSocket-based
- Real-time subscriptions
- No additional infrastructure

#### Implementation

**1. Database Schema**
```sql
-- Add realtime tracking to shoots table
CREATE TABLE photo_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shoot_id TEXT NOT NULL REFERENCES shoots(id),
  photo_url TEXT NOT NULL,
  selected_by TEXT NOT NULL, -- 'client' or 'photographer'
  selected_at TIMESTAMP DEFAULT NOW(),
  comment TEXT,
  UNIQUE(shoot_id, photo_url)
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE photo_selections;
```

**2. Realtime Service**
```typescript
// services/realtimeService.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export function subscribeToSelections(
  shootId: string,
  onUpdate: (selection: PhotoSelection) => void
) {
  const channel = supabase
    .channel(`shoot:${shootId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'photo_selections',
        filter: `shoot_id=eq.${shootId}`,
      },
      (payload) => {
        onUpdate(payload.new as PhotoSelection);
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}

export async function toggleSelection(
  shootId: string,
  photoUrl: string,
  selectedBy: string
) {
  const { data: existing } = await supabase
    .from('photo_selections')
    .select('*')
    .eq('shoot_id', shootId)
    .eq('photo_url', photoUrl)
    .single();

  if (existing) {
    // Deselect
    await supabase
      .from('photo_selections')
      .delete()
      .eq('id', existing.id);
  } else {
    // Select
    await supabase
      .from('photo_selections')
      .insert({
        shoot_id: shootId,
        photo_url: photoUrl,
        selected_by: selectedBy,
      });
  }
}
```

**3. UI Component**
```typescript
// components/RealtimeGallery.tsx
const RealtimeGallery = ({ shoot, userRole }: { userRole: 'client' | 'photographer' }) => {
  const [selections, setSelections] = useState<PhotoSelection[]>([]);
  const [liveIndicators, setLiveIndicators] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    // Subscribe to realtime updates
    const unsubscribe = subscribeToSelections(shoot.id, (newSelection) => {
      setSelections(prev => [...prev, newSelection]);

      // Show temporary indicator
      setLiveIndicators(prev => {
        const map = new Map(prev);
        map.set(newSelection.photo_url, newSelection.selected_by);
        return map;
      });

      // Remove indicator after 3 seconds
      setTimeout(() => {
        setLiveIndicators(prev => {
          const map = new Map(prev);
          map.delete(newSelection.photo_url);
          return map;
        });
      }, 3000);

      // Show notification
      if (newSelection.selected_by !== userRole) {
        showToast(
          `${newSelection.selected_by === 'client' ? 'Client' : 'Photographer'} selected a photo`,
          'info'
        );
      }
    });

    return unsubscribe;
  }, [shoot.id, userRole]);

  const isSelected = (photoUrl: string) => {
    return selections.some(s => s.photo_url === photoUrl);
  };

  const handleToggle = async (photoUrl: string) => {
    await toggleSelection(shoot.id, photoUrl, userRole);
  };

  return (
    <div className="realtime-gallery">
      <div className="header">
        <h2>{shoot.title}</h2>
        <div className="selection-counter">
          <span className="count">{selections.length}</span>
          <span className="label">photos selected</span>
          {userRole === 'client' && shoot.maxSelections && (
            <span className="limit">/ {shoot.maxSelections} max</span>
          )}
        </div>
      </div>

      <div className="photo-grid">
        {shoot.photos.map(photo => (
          <div
            key={photo.url}
            className={`photo-card ${isSelected(photo.url) ? 'selected' : ''}`}
          >
            <img src={photo.url} alt="" />

            <button
              className="select-btn"
              onClick={() => handleToggle(photo.url)}
            >
              {isSelected(photo.url) ? '✓ Selected' : 'Select'}
            </button>

            {liveIndicators.has(photo.url) && (
              <div className="live-indicator">
                {liveIndicators.get(photo.url) === 'client' ? (
                  <span>👤 Client just selected this</span>
                ) : (
                  <span>📸 Photographer just selected this</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

**4. Selection Limits (Prevent Over-Selection)**
```typescript
// Add to Shoot type
interface Shoot {
  // ... existing fields
  maxSelections?: number; // e.g., 30 photos
  selectionDeadline?: string; // ISO date
}

// Enforce limit
const handleToggle = async (photoUrl: string) => {
  const currentCount = selections.length;
  const isCurrentlySelected = isSelected(photoUrl);

  // Check limit before selecting
  if (!isCurrentlySelected && shoot.maxSelections && currentCount >= shoot.maxSelections) {
    showToast(`You've reached the maximum of ${shoot.maxSelections} selections`, 'warning');
    return;
  }

  await toggleSelection(shoot.id, photoUrl, userRole);
};
```

#### Benefits

**For Photographers:**
- See selections in real-time (know what client wants)
- Can "lock" favorites (guide client choices)
- No more parsing WhatsApp messages
- Activity log (when client was active)

**For Clients:**
- Instant feedback (see selection counter update)
- Collaborative feel (photographer can suggest)
- Clear limits (don't over-select)
- Comments per photo (request edits)

**Business Impact:**
- Selection time: 2-3 days → 2-3 hours
- Back-and-forth messages: 10-15 → 0-2
- Client satisfaction: Higher (feels involved)
- Faster delivery: Less waiting

---

### 3.3 Client Portal Dashboard 📊

**Effort:** 2 weeks | **Impact:** Medium-High

**Problem:** Clients have zero visibility into shoot progress

**Solution:** Dedicated client dashboard showing all their shoots and status

#### Implementation

**Route:** `/client/:clientId?token=xxx`

```typescript
// components/ClientPortal.tsx
const ClientPortal = ({ clientId, token }) => {
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all shoots for this client
    const fetchClientShoots = async () => {
      const allShoots = await fetchShootsByClient(clientId, token);
      setShoots(allShoots);
      setLoading(false);
    };

    fetchClientShoots();
  }, [clientId, token]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="client-portal">
      <header>
        <h1>Your Shoots</h1>
        <p>Studio Olga Prudka®</p>
      </header>

      <div className="shoots-list">
        {shoots.map(shoot => (
          <ShootCard key={shoot.id} shoot={shoot} />
        ))}
      </div>

      <div className="contact-section">
        <p>Questions about your shoot?</p>
        <a href="mailto:art@olgaprudka.com" className="contact-btn">
          Contact Us
        </a>
      </div>
    </div>
  );
};

const ShootCard = ({ shoot }) => {
  const status = getShootStatus(shoot);

  return (
    <div className="shoot-card">
      <div className="shoot-header">
        <h3>{shoot.title}</h3>
        <StatusBadge status={status} />
      </div>

      {status === 'upcoming' && (
        <div className="upcoming-info">
          <div className="info-row">
            <span className="label">Date:</span>
            <span className="value">{formatDate(shoot.date)}</span>
          </div>
          <div className="info-row">
            <span className="label">Time:</span>
            <span className="value">{shoot.startTime} - {shoot.endTime}</span>
          </div>
          <div className="info-row">
            <span className="label">Location:</span>
            <span className="value">{shoot.locationName}</span>
          </div>
          <a href={`/shoot/${shoot.id}?token=${shoot.accessToken}`} className="btn-primary">
            View Details
          </a>
        </div>
      )}

      {status === 'editing' && (
        <div className="editing-info">
          <div className="progress-bar">
            <div className="progress" style={{ width: `${shoot.editProgress || 0}%` }} />
          </div>
          <p>Editing in progress ({shoot.editProgress || 0}% complete)</p>
          <p className="estimate">Estimated delivery: {formatDate(shoot.estimatedDelivery)}</p>
        </div>
      )}

      {status === 'ready' && (
        <div className="ready-info">
          <p className="success">✅ Your gallery is ready!</p>
          <div className="stats">
            <span>{shoot.photos.length} photos</span>
            {shoot.selections?.length > 0 && (
              <span>{shoot.selections.length} favorites selected</span>
            )}
          </div>
          <a href={`/shoot/${shoot.id}?token=${shoot.accessToken}`} className="btn-primary">
            View Gallery
          </a>
          <button className="btn-secondary">Download All</button>
        </div>
      )}

      {status === 'delivered' && (
        <div className="delivered-info">
          <p>Delivered on {formatDate(shoot.deliveredAt)}</p>
          <a href={`/shoot/${shoot.id}?token=${shoot.accessToken}`} className="btn-secondary">
            View Gallery
          </a>
        </div>
      )}
    </div>
  );
};

function getShootStatus(shoot: Shoot): 'upcoming' | 'editing' | 'ready' | 'delivered' {
  if (shoot.deliveredAt) return 'delivered';
  if (shoot.photoStatus === 'completed') return 'ready';
  if (shoot.photoStatus === 'editing_in_progress') return 'editing';
  return 'upcoming';
}
```

#### Features

**Status Types:**
1. **Upcoming** - Shoot scheduled, show details & location
2. **Editing** - Photos being edited, show progress bar
3. **Ready** - Gallery ready for review/selection
4. **Delivered** - Final photos delivered

**Information Displayed:**
- Shoot details (date, time, location)
- Status & progress
- Estimated delivery date
- Photo counts
- Quick actions (view, download, contact)

#### Value Proposition

**For Clients:**
- Know exactly where their shoot stands
- No need to ask "when will photos be ready?"
- Central hub for all shoots with photographer
- Professional experience (feels like working with a big studio)

**For Photographers:**
- Reduces "status update" messages
- Sets clear expectations
- Encourages repeat bookings (see all past shoots)
- Cross-sell opportunity (upcoming shoot reminder)

---

### Phase 3 Summary

**Timeline:** Months 7-9
**Total Effort:** ~7 weeks
**Investment:**
- Music library: $50 (royalty-free tracks)
- Supabase Realtime: Included in current plan
- Total: ~$50

**Deliverables:**
- ✅ Magic link gallery experience
- ✅ Real-time selection collaboration
- ✅ Client portal dashboard
- ✅ Social sharing optimization
- ✅ Interactive photo comments

**Success Criteria:**
- 40%+ of clients share gallery on social media
- Client engagement time: 2 min → 15 min (7.5x)
- "When ready?" messages: -80%
- Client satisfaction score: 8/10 → 9.5/10
- Organic referrals: +50%

---

## PHASE 4: BUSINESS GROWTH ENGINE (Months 10-12)

**Goal:** Monetize platform, launch SaaS model, build revenue streams

---

### 4.1 Marketplace Mode (SaaS Launch) 💰

**Effort:** 4-6 weeks | **Impact:** Very High (Revenue generation)

**Transformation:** Internal tool → Multi-tenant SaaS platform

#### Multi-Tenancy Architecture

**1. Database Schema Updates**
```sql
-- Studios table (photographers/businesses)
CREATE TABLE studios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- for subdomain: studio-slug.clixy.com
  owner_email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  -- Subscription
  plan TEXT NOT NULL DEFAULT 'free', -- 'free', 'pro', 'studio'
  subscription_status TEXT, -- 'active', 'past_due', 'canceled'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,

  -- Branding
  logo_url TEXT,
  primary_color TEXT DEFAULT '#141413',
  cover_image TEXT,

  -- Settings
  custom_domain TEXT UNIQUE,
  settings JSONB DEFAULT '{}'::jsonb
);

-- Update shoots to belong to studios
ALTER TABLE shoots ADD COLUMN studio_id UUID REFERENCES studios(id);
CREATE INDEX idx_shoots_studio ON shoots(studio_id);

-- Row Level Security (RLS)
ALTER TABLE shoots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Studios can view own shoots"
  ON shoots FOR SELECT
  USING (studio_id = current_setting('app.current_studio_id')::uuid);

CREATE POLICY "Studios can insert own shoots"
  ON shoots FOR INSERT
  WITH CHECK (studio_id = current_setting('app.current_studio_id')::uuid);
```

**2. Authentication System**
```typescript
// services/authService.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export async function signUp(email: string, password: string, studioName: string) {
  // 1. Create Supabase auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  // 2. Create studio
  const slug = generateSlug(studioName);
  const { data: studio, error: studioError } = await supabase
    .from('studios')
    .insert({
      name: studioName,
      slug,
      owner_email: email,
      plan: 'free', // Start with free tier
    })
    .select()
    .single();

  if (studioError) throw studioError;

  // 3. Send welcome email
  await sendWelcomeEmail(email, studioName);

  return { user: authData.user, studio };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Fetch studio
  const { data: studio } = await supabase
    .from('studios')
    .select('*')
    .eq('owner_email', email)
    .single();

  return { user: data.user, studio };
}

export async function signOut() {
  await supabase.auth.signOut();
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
```

**3. Onboarding Flow**
```typescript
// components/Onboarding.tsx
const OnboardingWizard = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    studioName: '',
    email: '',
    password: '',
    plan: 'free',
  });

  const handleComplete = async () => {
    try {
      const { studio } = await signUp(
        formData.email,
        formData.password,
        formData.studioName
      );

      // Redirect to dashboard
      navigate(`/${studio.slug}/dashboard`);

      showToast('Welcome to Clixy! 🎉', 'success');
    } catch (error) {
      showToast('Failed to create account', 'error');
    }
  };

  return (
    <div className="onboarding">
      {step === 1 && (
        <Step1Welcome
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <Step2StudioInfo
          data={formData}
          onChange={setFormData}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <Step3SelectPlan
          selected={formData.plan}
          onChange={(plan) => setFormData({ ...formData, plan })}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
};

const Step1Welcome = ({ onNext }) => (
  <div className="step welcome">
    <h1>Welcome to Clixy</h1>
    <p>The modern way to manage photo shoots and delight clients</p>

    <div className="features">
      <div className="feature">
        <Icon name="camera" />
        <h3>Shoot Management</h3>
        <p>Organize shoots, teams, and timelines</p>
      </div>
      <div className="feature">
        <Icon name="sparkles" />
        <h3>AI-Powered Curation</h3>
        <p>Auto-select best photos in minutes</p>
      </div>
      <div className="feature">
        <Icon name="heart" />
        <h3>Client Experience</h3>
        <p>Beautiful galleries clients love to share</p>
      </div>
    </div>

    <button onClick={onNext} className="btn-primary">
      Get Started
    </button>
  </div>
);

const Step3SelectPlan = ({ selected, onChange, onComplete }) => (
  <div className="step plans">
    <h2>Choose Your Plan</h2>

    <div className="plan-cards">
      <PlanCard
        name="Free"
        price="$0"
        period="forever"
        features={[
          '5 shoots per month',
          '100 photos per shoot',
          'Basic client galleries',
          'Clixy branding',
        ]}
        selected={selected === 'free'}
        onClick={() => onChange('free')}
      />

      <PlanCard
        name="Pro"
        price="$49"
        period="per month"
        features={[
          'Unlimited shoots',
          'Unlimited photos',
          'AI photo curation (10/month)',
          'Custom branding',
          'Advanced analytics',
          'Priority support',
        ]}
        badge="Most Popular"
        selected={selected === 'pro'}
        onClick={() => onChange('pro')}
      />

      <PlanCard
        name="Studio"
        price="$149"
        period="per month"
        features={[
          'Everything in Pro',
          'Unlimited AI curation',
          'Multi-user access',
          'White-label (custom domain)',
          'API access',
          'Dedicated support',
        ]}
        selected={selected === 'studio'}
        onClick={() => onChange('studio')}
      />
    </div>

    <button onClick={onComplete} className="btn-primary">
      {selected === 'free' ? 'Start Free' : 'Start 14-Day Free Trial'}
    </button>

    <p className="note">
      {selected !== 'free' && 'No credit card required for trial'}
    </p>
  </div>
);
```

#### Pricing Tiers

| Feature | Free | Pro ($49/mo) | Studio ($149/mo) |
|---------|------|--------------|------------------|
| Shoots per month | 5 | Unlimited | Unlimited |
| Photos per shoot | 100 | Unlimited | Unlimited |
| AI curation | ❌ | 10/month | Unlimited |
| Custom branding | ❌ | ✅ | ✅ |
| Custom domain | ❌ | ❌ | ✅ |
| Team members | 1 | 1 | 5 |
| Analytics | Basic | Advanced | Advanced + API |
| Support | Email | Priority | Dedicated |

#### Billing Integration

**Use Stripe for payments**
```typescript
// services/billingService.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function createCheckoutSession(
  studioId: string,
  plan: 'pro' | 'studio'
) {
  const priceId = plan === 'pro'
    ? process.env.STRIPE_PRO_PRICE_ID
    : process.env.STRIPE_STUDIO_PRICE_ID;

  const session = await stripe.checkout.sessions.create({
    customer_email: studio.owner_email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.APP_URL}/${studio.slug}/dashboard?upgrade=success`,
    cancel_url: `${process.env.APP_URL}/${studio.slug}/settings/billing`,
    metadata: {
      studio_id: studioId,
      plan,
    },
  });

  return session.url;
}

export async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await activateSubscription(
        session.metadata.studio_id,
        session.subscription as string,
        session.customer as string,
        session.metadata.plan
      );
      break;

    case 'invoice.payment_succeeded':
      // Renew subscription
      break;

    case 'invoice.payment_failed':
      // Downgrade to free tier
      break;

    case 'customer.subscription.deleted':
      // Cancel subscription
      break;
  }
}

async function activateSubscription(
  studioId: string,
  subscriptionId: string,
  customerId: string,
  plan: string
) {
  await supabase
    .from('studios')
    .update({
      plan,
      subscription_status: 'active',
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
    })
    .eq('id', studioId);

  // Send confirmation email
  await sendUpgradeConfirmation(studioId);
}
```

#### Custom Domains

**For Studio tier only**
```typescript
// Setup with Vercel or Cloudflare
export async function setupCustomDomain(studioId: string, domain: string) {
  // 1. Verify DNS
  const isVerified = await verifyDNS(domain);
  if (!isVerified) {
    throw new Error('DNS not configured correctly');
  }

  // 2. Provision SSL certificate
  await provisionSSL(domain);

  // 3. Update studio
  await supabase
    .from('studios')
    .update({ custom_domain: domain })
    .eq('id', studioId);

  // 4. Update routing
  // (depends on hosting - Vercel, Cloudflare Workers, etc.)
}
```

---

### 4.2 Print Fulfillment Integration 🖼️

**Effort:** 2 weeks | **Impact:** Medium (Additional revenue stream)

**Problem:** Clients want prints, photographers coordinate manually

**Solution:** Integrate with print-on-demand service

#### Integration Options

**Option A: Printful** (Recommended)
- No upfront costs
- 200+ products (prints, canvas, albums, frames)
- Global shipping
- API for order automation

**Option B: WHCC (White House Custom Colour)**
- Professional quality
- Popular with pro photographers
- Requires account setup

**Option C: Bay Photo Lab**
- Premium quality
- Higher prices
- Better margins

#### Implementation

**1. Product Catalog**
```typescript
// constants/printProducts.ts
export const PRINT_PRODUCTS = [
  {
    id: 'print-4x6',
    name: '4x6" Print',
    baseCost: 0.50,
    retailPrice: 5.00,
    margin: 4.50,
    printfulProductId: '1234',
  },
  {
    id: 'print-8x10',
    name: '8x10" Print',
    baseCost: 2.50,
    retailPrice: 15.00,
    margin: 12.50,
    printfulProductId: '1235',
  },
  {
    id: 'canvas-16x20',
    name: '16x20" Canvas',
    baseCost: 35.00,
    retailPrice: 120.00,
    margin: 85.00,
    printfulProductId: '5678',
  },
  {
    id: 'album-10x10',
    name: '10x10" Photo Album (20 pages)',
    baseCost: 45.00,
    retailPrice: 150.00,
    margin: 105.00,
    printfulProductId: '9012',
  },
];
```

**2. Shopping Cart**
```typescript
// components/PrintShop.tsx
const PrintShop = ({ shoot }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const addToCart = (photoUrl: string, productId: string, quantity: number = 1) => {
    const product = PRINT_PRODUCTS.find(p => p.id === productId);

    setCart(prev => [
      ...prev,
      {
        photoUrl,
        product,
        quantity,
        subtotal: product.retailPrice * quantity,
      },
    ]);

    showToast('Added to cart', 'success');
  };

  const checkout = async () => {
    // Create order via Printful API
    const order = await createPrintfulOrder(cart, shoot);

    // Redirect to payment (Stripe)
    const checkoutUrl = await createPrintCheckout(order);
    window.location.href = checkoutUrl;
  };

  return (
    <div className="print-shop">
      <h2>Order Prints</h2>

      <div className="photo-selection">
        <h3>1. Select Photo</h3>
        <div className="photo-grid">
          {shoot.photos.map(photo => (
            <img
              key={photo.url}
              src={photo.url}
              alt=""
              className={selectedPhoto === photo.url ? 'selected' : ''}
              onClick={() => setSelectedPhoto(photo.url)}
            />
          ))}
        </div>
      </div>

      {selectedPhoto && (
        <div className="product-selection">
          <h3>2. Choose Product</h3>
          <div className="product-grid">
            {PRINT_PRODUCTS.map(product => (
              <div key={product.id} className="product-card">
                <h4>{product.name}</h4>
                <p className="price">${product.retailPrice}</p>
                <button onClick={() => addToCart(selectedPhoto, product.id)}>
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <div className="cart-summary">
          <h3>3. Review & Checkout</h3>
          <ul>
            {cart.map((item, i) => (
              <li key={i}>
                {item.product.name} × {item.quantity} = ${item.subtotal}
              </li>
            ))}
          </ul>
          <div className="total">
            Total: ${cart.reduce((sum, item) => sum + item.subtotal, 0)}
          </div>
          <button onClick={checkout} className="btn-primary">
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
};
```

**3. Printful API Integration**
```typescript
// services/printfulService.ts
import axios from 'axios';

const PRINTFUL_API = 'https://api.printful.com';
const API_KEY = process.env.PRINTFUL_API_KEY;

export async function createPrintfulOrder(cart: CartItem[], shoot: Shoot) {
  const items = cart.map(item => ({
    sync_variant_id: item.product.printfulProductId,
    quantity: item.quantity,
    files: [
      {
        url: item.photoUrl,
      },
    ],
  }));

  const response = await axios.post(
    `${PRINTFUL_API}/orders`,
    {
      recipient: {
        name: shoot.client,
        // Get from checkout form
        address1: '...',
        city: '...',
        state_code: '...',
        country_code: 'US',
        zip: '...',
      },
      items,
    },
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );

  return response.data.result;
}
```

#### Revenue Model

**For each print order:**
- Client pays retail price ($100)
- Printful charges cost ($45)
- **Gross margin: $55**
  - Photographer markup: $40 (photographer sets this)
  - Clixy platform fee: $15 (27% of margin)

**Example:**
- Client orders $500 in prints
- Printful cost: $225
- Margin: $275
- Photographer keeps: $200 (73%)
- Clixy earns: $75 (27%)

**Monthly Revenue Potential:**
- 100 photographers
- 10% use print shop
- Average order: $200/month
- Clixy share (27%): $540/month
- **Annual: $6,480**

Not huge, but nice passive income + better client experience.

---

### 4.3 Business Intelligence & Analytics 📈

**Effort:** 2 weeks | **Impact:** Medium

**Problem:** Photographers have no data on their business performance

**Solution:** Built-in analytics dashboard

#### Metrics to Track

**1. Shoot Metrics**
- Total shoots (by month, quarter, year)
- Shoots by type (editorial, commercial, portrait, etc.)
- Average shoots per month (trend)
- Busiest months (seasonal patterns)

**2. Revenue Metrics**
- Total revenue
- Revenue by shoot type
- Average revenue per shoot
- Revenue growth rate
- Print sales revenue

**3. Client Metrics**
- Total clients
- New vs returning clients
- Client retention rate
- Top clients (by revenue)
- Average client lifetime value

**4. Operational Metrics**
- Average delivery time (booking → final delivery)
- Time spent per shoot (estimate based on status changes)
- Photos delivered per shoot
- Client selection rate (favorites / total photos)

**5. Team Metrics**
- Most booked team members
- Team member performance
- Average team size per shoot

#### Implementation

**Database Views**
```sql
-- Monthly shoots summary
CREATE VIEW monthly_shoots_summary AS
SELECT
  studio_id,
  DATE_TRUNC('month', date) as month,
  COUNT(*) as total_shoots,
  COUNT(*) FILTER (WHERE project_type = 'editorial') as editorial_count,
  COUNT(*) FILTER (WHERE project_type = 'commercial') as commercial_count,
  SUM(payment_amount) as total_revenue,
  AVG(payment_amount) as avg_revenue
FROM shoots
GROUP BY studio_id, DATE_TRUNC('month', date);

-- Client retention
CREATE VIEW client_retention AS
SELECT
  studio_id,
  client,
  COUNT(*) as total_shoots,
  MIN(date) as first_shoot,
  MAX(date) as last_shoot,
  SUM(payment_amount) as lifetime_value
FROM shoots
GROUP BY studio_id, client;
```

**Analytics Dashboard Component**
```typescript
// components/AnalyticsDashboard.tsx
const AnalyticsDashboard = ({ studioId }) => {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [metrics, setMetrics] = useState<StudioMetrics | null>(null);

  useEffect(() => {
    fetchMetrics(studioId, timeRange).then(setMetrics);
  }, [studioId, timeRange]);

  if (!metrics) return <LoadingSpinner />;

  return (
    <div className="analytics-dashboard">
      <header>
        <h1>Business Analytics</h1>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </header>

      <div className="metrics-grid">
        <MetricCard
          title="Total Shoots"
          value={metrics.totalShoots}
          change={metrics.shootsGrowth}
          trend="up"
        />

        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          change={metrics.revenueGrowth}
          trend="up"
        />

        <MetricCard
          title="Avg Delivery Time"
          value={`${metrics.avgDeliveryDays} days`}
          change={metrics.deliveryTimeChange}
          trend="down" // Lower is better
        />

        <MetricCard
          title="Client Retention"
          value={`${metrics.retentionRate}%`}
          change={metrics.retentionChange}
          trend="up"
        />
      </div>

      <div className="charts">
        <ChartCard title="Revenue Trend">
          <LineChart data={metrics.revenueByMonth} />
        </ChartCard>

        <ChartCard title="Shoots by Type">
          <PieChart data={metrics.shootsByType} />
        </ChartCard>

        <ChartCard title="Top Clients">
          <BarChart data={metrics.topClients} />
        </ChartCard>
      </div>

      <div className="insights">
        <h2>🔍 Insights</h2>
        <ul>
          {metrics.insights.map((insight, i) => (
            <li key={i} className="insight-item">
              <Icon name={insight.icon} />
              <p>{insight.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Auto-generated insights
function generateInsights(metrics: StudioMetrics): Insight[] {
  const insights: Insight[] = [];

  // Revenue growth
  if (metrics.revenueGrowth > 20) {
    insights.push({
      icon: 'trending-up',
      text: `Revenue is up ${metrics.revenueGrowth}% vs last period! Keep it up! 🚀`,
    });
  }

  // Seasonal patterns
  const busiestMonth = findBusiestMonth(metrics.shootsByMonth);
  insights.push({
    icon: 'calendar',
    text: `${busiestMonth} is historically your busiest month. Plan accordingly!`,
  });

  // Client retention
  if (metrics.retentionRate > 60) {
    insights.push({
      icon: 'heart',
      text: `Great retention! ${metrics.retentionRate}% of clients book again.`,
    });
  } else {
    insights.push({
      icon: 'alert',
      text: `Only ${metrics.retentionRate}% of clients return. Consider a loyalty program.`,
    });
  }

  // Delivery time
  if (metrics.avgDeliveryDays > 14) {
    insights.push({
      icon: 'clock',
      text: `Avg delivery is ${metrics.avgDeliveryDays} days. Clients expect 7-10 days.`,
    });
  }

  return insights;
}
```

**Charts** (using Chart.js or Recharts)
```typescript
import { Line, Pie, Bar } from 'recharts';

const LineChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <Line data={data}>
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="revenue" stroke="#141413" />
    </Line>
  </ResponsiveContainer>
);
```

#### Value Proposition

**For Photographers:**
- Understand business performance
- Identify seasonal patterns
- Price shoots based on data
- Track client lifetime value
- Optimize operations (reduce delivery time)

**For Clixy (SaaS):**
- Premium feature (Pro/Studio tier only)
- Increases perceived value
- Data-driven photographers more successful
- Higher retention (they rely on analytics)

---

### Phase 4 Summary

**Timeline:** Months 10-12
**Total Effort:** ~10 weeks
**Investment:**
- Stripe setup: $0 (pay per transaction)
- Printful integration: $0 (pay per order)
- Domain infrastructure: $50/month
- Total: ~$150

**Deliverables:**
- ✅ Multi-tenant SaaS architecture
- ✅ 3-tier pricing (Free, Pro, Studio)
- ✅ Stripe billing integration
- ✅ Print fulfillment shop
- ✅ Analytics dashboard
- ✅ Onboarding wizard

**Revenue Targets:**
- Month 10: Launch beta, 10 paying studios ($500 MRR)
- Month 11: 30 studios ($1,500 MRR)
- Month 12: 50 studios ($2,500 MRR)
- **Year 1 ARR: $30K** (conservative)

**Success Criteria:**
- 50+ paying customers
- <5% churn rate
- NPS > 50
- $30K ARR

---

## PHASE 5: ECOSYSTEM & NETWORK EFFECTS (Months 13-18)

**Goal:** Build competitive moats through network effects

---

### 5.1 Team Network 🌐

**Effort:** 6 weeks | **Impact:** Very High (Network effects)

**Vision:** Clixy becomes the "LinkedIn for photography teams"

#### Features

**1. Professional Profiles**
```typescript
interface TeamMemberProfile {
  id: string;
  name: string;
  role: 'photographer' | 'stylist' | 'makeup_artist' | 'model' | 'assistant';
  location: string;
  bio: string;
  portfolio: string[];
  skills: string[];
  hourlyRate?: number;
  availability: AvailabilityCalendar;
  rating: number; // 0-5
  reviews: Review[];
  stats: {
    shootsCompleted: number;
    yearsExperience: number;
    responseTime: string; // e.g., "< 2 hours"
  };
}
```

**2. Discovery & Search**
```typescript
// components/TeamDirectory.tsx
const TeamDirectory = () => {
  const [filters, setFilters] = useState({
    role: null,
    location: '',
    minRating: 0,
    maxRate: 1000,
    available: null, // date
  });

  const [results, setResults] = useState<TeamMemberProfile[]>([]);

  const handleSearch = async () => {
    const members = await searchTeamMembers(filters);
    setResults(members);
  };

  return (
    <div className="team-directory">
      <h1>Find Your Team</h1>

      <div className="filters">
        <select
          value={filters.role}
          onChange={(e) => setFilters({...filters, role: e.target.value})}
        >
          <option value="">All Roles</option>
          <option value="stylist">Stylist</option>
          <option value="makeup_artist">Makeup Artist</option>
          <option value="model">Model</option>
        </select>

        <input
          type="text"
          placeholder="Location (NYC, LA, etc.)"
          value={filters.location}
          onChange={(e) => setFilters({...filters, location: e.target.value})}
        />

        <input
          type="date"
          placeholder="Available on..."
          onChange={(e) => setFilters({...filters, available: e.target.value})}
        />

        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="results">
        {results.map(member => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
};

const TeamMemberCard = ({ member }) => (
  <div className="team-member-card">
    <img src={member.avatar} alt={member.name} />
    <div className="info">
      <h3>{member.name}</h3>
      <p className="role">{member.role}</p>
      <p className="location">{member.location}</p>
      <div className="rating">
        {'⭐'.repeat(Math.floor(member.rating))} {member.rating.toFixed(1)}
      </div>
      <p className="stats">
        {member.stats.shootsCompleted} shoots • {member.stats.yearsExperience} years
      </p>
    </div>
    <div className="actions">
      <button onClick={() => viewProfile(member.id)}>
        View Profile
      </button>
      <button onClick={() => bookMember(member.id)}>
        Book
      </button>
    </div>
  </div>
);
```

**3. Booking Integration**
```typescript
// Book team member directly for a shoot
async function bookTeamMember(
  shootId: string,
  memberId: string,
  role: string
) {
  // 1. Check availability
  const isAvailable = await checkAvailability(memberId, shootDate);
  if (!isAvailable) {
    throw new Error('Member not available on this date');
  }

  // 2. Send booking request
  await sendBookingRequest({
    shootId,
    memberId,
    role,
    rate: member.hourlyRate,
    duration: shoot.duration,
  });

  // 3. Notify member
  await sendNotification(memberId, {
    type: 'booking_request',
    shoot: shoot,
    photographer: currentUser,
  });
}
```

**4. Reviews & Ratings**
```typescript
// After shoot completion
const ReviewModal = ({ teamMember, shootId }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    await submitReview({
      revieweeId: teamMember.id,
      shootId,
      rating,
      comment,
      reviewerId: currentUser.id,
    });

    showToast('Review submitted!', 'success');
  };

  return (
    <Modal title="Rate Team Member">
      <h3>How was {teamMember.name}?</h3>

      <div className="rating-selector">
        {[1, 2, 3, 4, 5].map(val => (
          <button
            key={val}
            className={rating >= val ? 'selected' : ''}
            onClick={() => setRating(val)}
          >
            ⭐
          </button>
        ))}
      </div>

      <textarea
        placeholder="What did you appreciate about working with them?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button onClick={handleSubmit}>Submit Review</button>
    </Modal>
  );
};
```

#### Network Effects

**Initial State:** 10 photographers, 0 team members
- Low value (no one to hire)

**Growth:** 100 photographers, 50 team members
- Some value (limited options)

**Tipping Point:** 500 photographers, 200+ team members
- High value (critical mass)
- Team members join because photographers are there
- Photographers stay because team members are there
- **Virtuous cycle begins**

**Scale:** 2000+ photographers, 1000+ team members
- Dominant platform
- Hard to leave (all connections here)
- Competitors can't replicate network

#### Monetization

**For Platform (Clixy):**
- **Premium profiles:** $20/month (featured placement)
- **Booking fees:** 5% of team member payments
- **Verified badges:** $50/year

**Revenue Example:**
- 200 team members with premium profiles: $4,000/month
- 500 bookings/month at $500 avg × 5% fee: $12,500/month
- **Total: $16,500/month ($198K/year)**

---

### 5.2 Location Database 📍

**Effort:** 4 weeks | **Impact:** High

**Problem:** Finding shoot locations is time-consuming, knowledge is fragmented

**Solution:** Crowdsourced database of photography locations

#### Data Model

```typescript
interface PhotoLocation {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  category: 'outdoor' | 'indoor' | 'studio' | 'venue';

  // Details
  description: string;
  photos: string[];
  bestTimeOfDay: string[];
  bestSeason: string[];

  // Logistics
  permitRequired: boolean;
  permitCost?: number;
  permitLink?: string;
  parkingAvailable: boolean;
  accessibilityNotes: string;

  // Ratings
  rating: number;
  reviews: LocationReview[];

  // Metadata
  addedBy: string; // Studio ID
  usageCount: number; // How many shoots used this
  sampleShoots: string[]; // Shoot IDs (showcase)
}
```

#### Features

**1. Discovery Map**
```typescript
// components/LocationMap.tsx
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';

const LocationMap = () => {
  const [locations, setLocations] = useState<PhotoLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<PhotoLocation | null>(null);
  const [filters, setFilters] = useState({
    category: null,
    permitRequired: null,
    minRating: 0,
  });

  useEffect(() => {
    fetchLocations(filters).then(setLocations);
  }, [filters]);

  return (
    <div className="location-map">
      <div className="map-filters">
        <select onChange={(e) => setFilters({...filters, category: e.target.value})}>
          <option value="">All Types</option>
          <option value="outdoor">Outdoor</option>
          <option value="studio">Studio</option>
          <option value="venue">Venue</option>
        </select>

        <label>
          <input
            type="checkbox"
            checked={filters.permitRequired === false}
            onChange={(e) => setFilters({...filters, permitRequired: e.target.checked ? false : null})}
          />
          No permit required
        </label>
      </div>

      <GoogleMap
        center={{ lat: 40.7128, lng: -74.0060 }} // NYC
        zoom={12}
      >
        {locations.map(loc => (
          <Marker
            key={loc.id}
            position={loc.coordinates}
            onClick={() => setSelectedLocation(loc)}
          />
        ))}

        {selectedLocation && (
          <InfoWindow
            position={selectedLocation.coordinates}
            onCloseClick={() => setSelectedLocation(null)}
          >
            <LocationPreview location={selectedLocation} />
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};
```

**2. Location Details Page**
```typescript
const LocationDetails = ({ locationId }) => {
  const [location, setLocation] = useState<PhotoLocation | null>(null);

  useEffect(() => {
    fetchLocation(locationId).then(setLocation);
  }, [locationId]);

  if (!location) return <LoadingSpinner />;

  return (
    <div className="location-details">
      <header>
        <h1>{location.name}</h1>
        <div className="rating">
          {'⭐'.repeat(Math.floor(location.rating))} {location.rating.toFixed(1)}
        </div>
      </header>

      <div className="photo-gallery">
        {location.photos.map(url => (
          <img key={url} src={url} alt="" />
        ))}
      </div>

      <div className="info-grid">
        <div className="info-section">
          <h3>Details</h3>
          <p>{location.description}</p>
          <p><strong>Category:</strong> {location.category}</p>
          <p><strong>Best time:</strong> {location.bestTimeOfDay.join(', ')}</p>
          <p><strong>Best season:</strong> {location.bestSeason.join(', ')}</p>
        </div>

        <div className="info-section">
          <h3>Logistics</h3>
          <p>
            <strong>Permit:</strong>{' '}
            {location.permitRequired ? (
              <>
                Required ({formatCurrency(location.permitCost)}){' '}
                {location.permitLink && <a href={location.permitLink}>Apply</a>}
              </>
            ) : (
              'Not required'
            )}
          </p>
          <p><strong>Parking:</strong> {location.parkingAvailable ? 'Available' : 'Limited'}</p>
          {location.accessibilityNotes && (
            <p><strong>Accessibility:</strong> {location.accessibilityNotes}</p>
          )}
        </div>
      </div>

      <div className="sample-shoots">
        <h3>Example Shoots at This Location</h3>
        <div className="shoot-grid">
          {location.sampleShoots.map(shootId => (
            <ShootCard key={shootId} shootId={shootId} />
          ))}
        </div>
      </div>

      <div className="reviews">
        <h3>Reviews ({location.reviews.length})</h3>
        {location.reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      <button onClick={() => addLocationToShoot(location)}>
        Use This Location
      </button>
    </div>
  );
};
```

**3. Contribution Flow**
```typescript
// After completing a shoot, suggest adding location
const LocationContribution = ({ shoot }) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    setIsAdding(true);

    const location: PhotoLocation = {
      name: shoot.locationName,
      address: shoot.locationAddress,
      coordinates: await geocode(shoot.locationAddress),
      category: 'outdoor', // User selects
      description: '', // User fills
      photos: shoot.photos.slice(0, 5), // Use shoot photos
      bestTimeOfDay: inferFromShootTime(shoot.startTime),
      permitRequired: false, // User fills
      addedBy: currentStudio.id,
    };

    await createLocation(location);
    showToast('Thanks for contributing! 🙏', 'success');
    setIsAdding(false);
  };

  return (
    <div className="location-contribution">
      <h3>Share This Location?</h3>
      <p>Help other photographers discover {shoot.locationName}</p>
      <button onClick={handleAdd} disabled={isAdding}>
        {isAdding ? 'Adding...' : 'Add to Location Database'}
      </button>
    </div>
  );
};
```

#### Network Effects

**Contribution Incentives:**
- **Gamification:** Badges for contributions (Explorer, Navigator, etc.)
- **Credits:** Earn platform credits for adding locations
- **Recognition:** Top contributors featured on homepage
- **SEO:** Locations link back to contributor's profile

**Growth Loop:**
1. Photographer uses location → Adds to database
2. More locations → More value for other photographers
3. More photographers join → More locations added
4. Database becomes comprehensive
5. **Competitive moat:** No one else has this data

#### Monetization

**Free:** Browse, search, view details
**Pro:** Add unlimited locations, featured locations
**Direct Booking:** Partner with venues for commission

**Example:**
- Partner with 50 studios/venues
- 10% commission on bookings through platform
- Average booking: $1,000
- 100 bookings/month × $100 commission = $10,000/month

---

### 5.3 AI Shot List Generator 📝

**Effort:** 2 weeks | **Impact:** Medium

**Problem:** Planning shot lists takes 2-3 hours per shoot

**Solution:** GPT-4 powered shot list generator

#### Implementation

```typescript
// services/shotListService.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateShotList(
  briefing: ShootBriefing
): Promise<ShotList> {
  const prompt = `
You are an expert photography director. Generate a comprehensive shot list for the following shoot:

Type: ${briefing.type}
Style: ${briefing.style}
Location: ${briefing.location}
Duration: ${briefing.duration} minutes
Vibe: ${briefing.vibe}
Special requirements: ${briefing.requirements || 'None'}

Generate a shot list with 3 categories:
1. Essential Shots (must-have, 15-20 min)
2. Creative Shots (nice-to-have, 10-15 min)
3. Detail Shots (filler, 5 min)

For each shot, provide:
- Shot description
- Estimated time needed
- Camera settings recommendation (if applicable)
- Composition notes

Format as structured JSON.
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a professional photography director with 20 years of experience.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  const shotList = JSON.parse(response.choices[0].message.content);
  return shotList;
}
```

**UI Component**
```typescript
const ShotListGenerator = () => {
  const [briefing, setBriefing] = useState<ShootBriefing>({
    type: 'portrait',
    style: 'editorial',
    location: 'urban',
    duration: 60,
    vibe: 'moody',
    requirements: '',
  });

  const [shotList, setShotList] = useState<ShotList | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    const list = await generateShotList(briefing);
    setShotList(list);
    setGenerating(false);
  };

  return (
    <div className="shot-list-generator">
      <h2>🤖 AI Shot List Generator</h2>

      <form>
        <select
          value={briefing.type}
          onChange={(e) => setBriefing({...briefing, type: e.target.value})}
        >
          <option value="portrait">Portrait</option>
          <option value="editorial">Editorial</option>
          <option value="commercial">Commercial</option>
          <option value="wedding">Wedding</option>
        </select>

        <input
          placeholder="Style (e.g., moody, bright, cinematic)"
          value={briefing.style}
          onChange={(e) => setBriefing({...briefing, style: e.target.value})}
        />

        <input
          placeholder="Location (e.g., urban, nature, studio)"
          value={briefing.location}
          onChange={(e) => setBriefing({...briefing, location: e.target.value})}
        />

        <input
          type="number"
          placeholder="Duration (minutes)"
          value={briefing.duration}
          onChange={(e) => setBriefing({...briefing, duration: parseInt(e.target.value)})}
        />

        <textarea
          placeholder="Special requirements or notes..."
          value={briefing.requirements}
          onChange={(e) => setBriefing({...briefing, requirements: e.target.value})}
        />

        <button onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generating...' : 'Generate Shot List'}
        </button>
      </form>

      {shotList && (
        <div className="shot-list">
          <h3>📸 Your Shot List</h3>

          <section>
            <h4>Essential Shots ({shotList.essential.length})</h4>
            <ul>
              {shotList.essential.map((shot, i) => (
                <li key={i}>
                  <strong>{shot.description}</strong>
                  <span className="time">{shot.timeNeeded} min</span>
                  {shot.composition && <p className="note">{shot.composition}</p>}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h4>Creative Shots ({shotList.creative.length})</h4>
            <ul>
              {shotList.creative.map((shot, i) => (
                <li key={i}>
                  <strong>{shot.description}</strong>
                  <span className="time">{shot.timeNeeded} min</span>
                  {shot.composition && <p className="note">{shot.composition}</p>}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h4>Detail Shots ({shotList.details.length})</h4>
            <ul>
              {shotList.details.map((shot, i) => (
                <li key={i}>{shot.description}</li>
              ))}
            </ul>
          </section>

          <div className="actions">
            <button onClick={() => addToShoot(shotList)}>
              Add to Shoot
            </button>
            <button onClick={() => exportPDF(shotList)}>
              Export PDF
            </button>
            <button onClick={handleGenerate}>
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

#### Cost

**OpenAI GPT-4:**
- ~$0.03 per generation (500 tokens)
- Include 10 generations/month in Pro tier
- Additional: $1 per generation (or buy packs)

#### Value

**Time saved:** 2-3 hours → 5 minutes
**Learning:** Junior photographers learn from AI suggestions
**Consistency:** Ensures comprehensive coverage

---

### Phase 5 Summary

**Timeline:** Months 13-18
**Total Effort:** ~12 weeks
**Investment:**
- Google Maps API: $200/month
- OpenAI API: $100/month
- Total: ~$1,800 for phase

**Deliverables:**
- ✅ Team network (discovery, booking, reviews)
- ✅ Location database (map, details, contributions)
- ✅ AI shot list generator
- ✅ Network effects established

**Revenue Targets:**
- Team network: $16,500/month ($198K/year)
- Location partnerships: $10,000/month ($120K/year)
- **Total additional ARR: $318K**

**Success Criteria:**
- 200+ team members on platform
- 500+ locations in database
- Network effects visible (growth accelerating)
- Competitive moat established

---

## 🎯 COMBINED ROADMAP SUMMARY

### Revenue Projection (18 Months)

| Month | MRR | ARR | Customers | Key Milestone |
|-------|-----|-----|-----------|---------------|
| 1-3 | $0 | $0 | 1 | Phase 1 complete (internal tool polished) |
| 4-6 | $0 | $0 | 1 | Phase 2 complete (AI features) |
| 7-9 | $0 | $0 | 1 | Phase 3 complete (client experience) |
| 10 | $500 | $6K | 10 | 🚀 Beta launch |
| 11 | $1,500 | $18K | 30 | Early adopters |
| 12 | $2,500 | $30K | 50 | Product-market fit |
| 13-14 | $5,000 | $60K | 100 | Network effects start |
| 15-16 | $10,000 | $120K | 200 | Accelerating growth |
| 17-18 | $20,000 | $240K | 400 | Scale mode |

**Conservative 18-month target: $240K ARR**
**Optimistic 18-month target: $500K ARR**

---

### Total Investment Required

| Phase | Duration | Cost | Notes |
|-------|----------|------|-------|
| Phase 1 | Months 1-3 | $0 | Use existing tools |
| Phase 2 | Months 4-6 | $1,200 | Google Cloud Vision |
| Phase 3 | Months 7-9 | $50 | Music library |
| Phase 4 | Months 10-12 | $150 | Infrastructure |
| Phase 5 | Months 13-18 | $1,800 | APIs (Maps, OpenAI) |
| **Total** | **18 months** | **$3,200** | **Bootstrappable** |

**Conclusion: Can be bootstrapped without external funding**

---

### Success Metrics (18-Month Targets)

**Product:**
- 400+ active studios using platform
- 200+ team members in network
- 500+ locations in database
- 90% feature adoption (AI curation, galleries, etc.)

**Business:**
- $240K ARR
- 80% gross margins
- <5% monthly churn
- NPS > 60
- CAC < $150
- LTV > $2,000
- LTV/CAC > 13x

**Market:**
- Top 3 player in photography SaaS space
- 10% market share of target segment
- Recognized brand in photographer communities
- Featured in industry publications

---

## 💡 WILD IDEAS (Future Exploration)

### 1. Live Shoot Mode 📹
Real-time shoot management via mobile app
- Shot list checklist
- Live photo backup
- Client preview feed
- Team coordination
- **Effort:** 8 weeks | **Impact:** High

### 2. AI Style Transfer 🎨
Apply photographer's signature style automatically
- Upload signature photos
- AI learns style
- Auto-apply to new shoots
- **Effort:** 6 weeks | **Impact:** Very High

### 3. Virtual Staging 🏠
Change backgrounds/lighting in post
- Outdoor → studio background
- Day → sunset
- Remove distractions
- **Effort:** 8 weeks | **Impact:** Medium

### 4. Booking Automation 🤝
From inquiry to booked shoot in 3 clicks
- AI analyzes request
- Suggests packages
- Auto-generates contract
- **Effort:** 4 weeks | **Impact:** High

### 5. Social Media Auto-Poster 📱
Auto-generate social content from shoots
- AI selects best photos
- Generates captions
- Schedules posts
- **Effort:** 3 weeks | **Impact:** Medium

---

## 🏁 NEXT STEPS

### Immediate Actions (This Week)

1. **Validate Roadmap**
   - Review with stakeholders
   - Prioritize phases based on business goals
   - Adjust timeline if needed

2. **Start Phase 1**
   - Implement quick wins (keyboard shortcuts, duplicate, etc.)
   - Goal: Ship improvements in 2 weeks

3. **Market Research**
   - Interview 10 photographers outside current user base
   - Validate pain points
   - Test willingness to pay

4. **Technical Prep**
   - Set up multi-tenancy architecture
   - Plan database schema changes
   - Research AI APIs

### Month 1-2 Goals

- ✅ Complete Phase 1 quick wins
- ✅ Validate AI curation approach
- ✅ Build landing page for SaaS launch
- ✅ Create pricing page
- ✅ Set up Stripe test mode

### Month 3 Goals

- ✅ Complete Phase 1 entirely
- ✅ Beta test AI curation internally
- ✅ Finalize SaaS architecture
- ✅ Recruit 10 beta testers

---

## ❓ OPEN QUESTIONS

**Strategic:**
1. Bootstrap vs seek funding?
2. Target solo photographers or studios first?
3. Focus on specific niche (wedding, editorial, etc.)?
4. Geographic focus (US-first, global from day 1)?

**Product:**
5. Which Phase 2 AI feature to build first?
6. Free tier - generous or restrictive?
7. Mobile app priority (Phase 6+)?
8. Open API for integrations?

**Business:**
9. Pricing - monthly vs annual discounts?
10. How aggressive on growth vs profitability?

---

**Document Status:** FINAL
**Last Updated:** 2025-12-29
**Next Review:** 2026-01-15
**Owner:** Product Team
