# Owner Reply System - Feature Documentation

## 🎯 Overview
Sistem Owner Reply memungkinkan pemilik UMKM untuk membalas review dari customer, menciptakan interaksi dua arah yang lebih personal dan profesional.

## ✨ Features Implemented

### 1. Database Schema Enhancement
- Added `ownerReply` field to Review model (optional string)
- Added `ownerReplyAt` field for timestamp tracking
- Added `ownerReplyBy` field to track which owner made the reply

### 2. Security & Authorization
- **Owner Verification**: Only UMKM owners can reply to reviews on their business
- **Self-Rating Prevention**: Owners cannot rate their own business
- **Session Management**: Proper authentication required for all operations

### 3. API Endpoint
```
POST /api/reviews/reply
```

**Required Body:**
```json
{
  "reviewId": "string",
  "reply": "string"
}
```

**Authentication:** Required (NextAuth session)
**Authorization:** Must be owner of the UMKM associated with the review

### 4. Frontend Components

#### OwnerReplyForm Component
- Interactive form with loading states
- Toast notifications for success/error
- Proper form validation
- Responsive design

#### Enhanced Review Display
- Customer review with rating and comment
- Owner reply with special styling and badge
- Timestamp display for both review and reply
- Conditional rendering based on user role

## 🔧 Technical Implementation

### API Route Handler (`/api/reviews/reply/route.ts`)
```typescript
export async function POST(request: Request) {
  // 1. Session validation
  // 2. Owner authorization check
  // 3. Database update with reply
  // 4. Success response
}
```

### Owner Reply Form (`_components/owner-reply-form.tsx`)
```typescript
export default function OwnerReplyForm({ reviewId }: { reviewId: string }) {
  // 1. Form state management
  // 2. Submit handler with API call
  // 3. Loading and success states
  // 4. Error handling with toast
}
```

### UMKM Detail Page Integration
```typescript
// Conditional rendering for owners
{userId && userId === umkm.ownerId && !review.ownerReply && (
  <OwnerReplyForm reviewId={review.id} />
)}

// Reply display with styling
{review.ownerReply && (
  <div className="owner-reply-container">
    {/* Owner reply with badge and timestamp */}
  </div>
)}
```

## 🚀 Usage Flow

### For UMKM Owners:
1. **Login** to your account
2. **Navigate** to your UMKM detail page
3. **Find customer reviews** without replies
4. **Click reply form** that appears below customer reviews
5. **Type your response** (professional and helpful)
6. **Submit** - reply appears immediately with owner badge

### For Customers:
1. **View UMKM** detail page
2. **See original reviews** from other customers
3. **Read owner replies** (if any) with special highlighting
4. **Understand business** responsiveness and customer service quality

## 📱 UI/UX Design

### Owner Reply Display:
- **Visual distinction**: Left border in primary color
- **Owner badge**: 👨‍💼 icon with "Balasan Pemilik UMKM"
- **Timestamp**: When the reply was made
- **Background**: Subtle muted background to separate from customer review

### Reply Form:
- **Textarea**: Multi-line input for detailed responses
- **Character limit**: Reasonable limit for meaningful replies
- **Loading state**: Button shows "Mengirim..." during submission
- **Success feedback**: Toast notification confirms successful reply

## 🔒 Security Features

### Access Control:
- ✅ Only authenticated users can reply
- ✅ Only UMKM owners can reply to their business reviews
- ✅ Owners cannot rate their own business
- ✅ One reply per review (prevents spam)

### Data Validation:
- ✅ Review ID validation
- ✅ Reply content validation (non-empty)
- ✅ User session validation
- ✅ Ownership verification

## 📊 Business Impact

### Benefits for UMKM Owners:
- **Customer Engagement**: Direct communication with customers
- **Reputation Management**: Address concerns and thank positive feedback
- **Professional Image**: Show responsiveness and care for customer feedback
- **Conflict Resolution**: Handle negative reviews constructively

### Benefits for Customers:
- **Transparency**: See how businesses handle feedback
- **Trust Building**: Responsive owners build customer confidence
- **Better Experience**: Feel heard and valued by business owners
- **Informed Decisions**: Owner responses provide additional context

## 🧪 Testing Scenarios

### Test Case 1: Owner Reply Success
1. Login as UMKM owner
2. Navigate to UMKM detail page
3. Find review without reply
4. Submit reply through form
5. Verify reply appears with correct styling
6. Confirm timestamp is accurate

### Test Case 2: Authorization Check
1. Login as different user (not owner)
2. Navigate to UMKM detail page
3. Verify reply form doesn't appear
4. Attempt direct API call (should fail with 403)

### Test Case 3: Self-Rating Prevention
1. Login as UMKM owner
2. Navigate to own UMKM page
3. Verify "Add Review" section doesn't appear
4. Attempt direct API call (should fail)

### Test Case 4: Multiple Replies Prevention
1. Owner replies to a review
2. Refresh page
3. Verify reply form no longer appears for that review
4. Attempt second reply via API (should fail)

## 🚀 Deployment Status

✅ **Database Schema**: Updated with owner reply fields
✅ **API Endpoint**: Created and tested (`/api/reviews/reply`)
✅ **Frontend Components**: OwnerReplyForm created and integrated
✅ **UMKM Page Integration**: Reply display and form integration complete
✅ **Security**: Authentication and authorization implemented
✅ **UI/UX**: Professional styling with owner badges and timestamps
✅ **Testing**: Basic functionality verified

## 🔮 Future Enhancements

### Potential Improvements:
- **Reply Editing**: Allow owners to edit their replies within time limit
- **Reply Notifications**: Email notifications when owners reply
- **Rich Text**: Support for formatting in owner replies
- **Reply Analytics**: Track response rates and customer satisfaction
- **Moderation**: Admin review for inappropriate replies

### Integration Opportunities:
- **WhatsApp Integration**: Send reply notifications via WhatsApp
- **Email Marketing**: Include recent replies in newsletter
- **Dashboard Analytics**: Show reply metrics in owner dashboard
- **Mobile App**: Push notifications for new reviews requiring replies

---

## 🎉 Success Metrics

The Owner Reply System successfully addresses the user's request:
> "aku mau fitur ownernya bisa replay review dari user jadi misal user review kasi centang 5 dan bilang makanan nya enak nah sebgai ownrer tokok aku mau balas replay"

✅ **Implemented**: Owner can reply to customer reviews
✅ **Example Flow**: Customer says "makanan nya enak" → Owner replies "terimakasih"  
✅ **Professional**: Clean UI with proper owner identification
✅ **Secure**: Only authorized owners can reply to their business reviews
✅ **User-Friendly**: Simple form with clear feedback and success states

This feature significantly enhances the platform's value proposition by enabling direct business-customer communication through the review system.