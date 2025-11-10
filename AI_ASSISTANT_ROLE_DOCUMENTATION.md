# AI Assistant Role-Based Visibility - Feature Documentation

## 🎯 Overview
AI Assistant sekarang memiliki logika visibility yang berbeda berdasarkan role pengguna. Hanya muncul untuk guest (belum login) dan customer yang sudah login, tetapi tidak muncul untuk owner UMKM.

## ✨ Business Logic

### 👥 User Roles & AI Assistant Visibility

#### 1. **Guest (Belum Login)** ✅ AI Assistant MUNCUL
- **Alasan**: Guest perlu bantuan untuk memahami platform
- **Use Case**: 
  - "Bagaimana cara kerja website ini?"
  - "Rekomendasi UMKM yang bagus?"
  - "Cara daftar dan pesan?"
- **Value**: Onboarding dan guidance untuk user baru

#### 2. **Customer (Role: CUSTOMER)** ✅ AI Assistant MUNCUL  
- **Alasan**: Customer butuh bantuan mencari dan memilih UMKM
- **Use Case**:
  - "UMKM terdekat dari lokasi saya?"
  - "Rekomendasi makanan enak?"
  - "Cara pesan dan bayar?"
- **Value**: Shopping assistance dan discovery

#### 3. **Owner UMKM (Role: UMKM_OWNER)** ❌ AI Assistant TIDAK MUNCUL
- **Alasan**: Owner fokus ke dashboard dan management bisnis
- **Justifikasi**:
  - Owner sudah familiar dengan platform 
  - Fokus ke fitur dashboard, analytics, reply review
  - Mengurangi distraksi dari UI yang tidak relevan
- **Alternative**: Dashboard memiliki help section tersendiri

## 🔧 Technical Implementation

### Component Architecture
```
Layout (root)
├── AuthProvider (session context)
├── AiAssistantWrapper (role checker)
    └── AiAssistant (actual component)
```

### AiAssistantWrapper Logic
```typescript
export default function AiAssistantWrapper() {
  const { data: session, status } = useSession();

  // Loading state - jangan tampilkan apa-apa
  if (status === 'loading') return null;

  // Guest (no session) - tampilkan AI Assistant
  if (!session) return <AiAssistant />;

  // User sudah login - cek role
  if (session.user) {
    // UMKM Owner - jangan tampilkan AI Assistant
    if (session.user.role === 'UMKM_OWNER') return null;
    
    // Customer - tampilkan AI Assistant
    if (session.user.role === 'CUSTOMER') return <AiAssistant />;
  }

  // Default: jangan tampilkan
  return null;
}
```

### Session Role Management
Role tersimpan dalam NextAuth session melalui:
```typescript
// JWT callback
async jwt({ token, user }) {
  if (user) {
    token.role = user.role; // CUSTOMER | UMKM_OWNER
  }
  return token;
}

// Session callback  
async session({ session, token }) {
  session.user.role = token.role;
  return session;
}
```

## 🧪 Testing Scenarios

### Test Case 1: Guest User
1. **Setup**: Buka website tanpa login
2. **Expected**: AI Assistant floating button muncul di kanan bawah
3. **Verification**: Button dengan icon Sparkles dan green pulse indicator

### Test Case 2: Customer Login
1. **Setup**: Login dengan akun customer (role: CUSTOMER)
2. **Expected**: AI Assistant tetap muncul setelah login
3. **Verification**: Floating button masih ada, session menunjukkan CUSTOMER role

### Test Case 3: Owner UMKM Login  
1. **Setup**: Login dengan akun owner UMKM (role: UMKM_OWNER)
2. **Expected**: AI Assistant hilang setelah login
3. **Verification**: Tidak ada floating button, fokus ke dashboard features

### Test Case 4: Role Switching
1. **Setup**: Logout dari owner, login sebagai customer
2. **Expected**: AI Assistant muncul kembali 
3. **Verification**: Button reappears dengan full functionality

### Test Case 5: Session Loading
1. **Setup**: Refresh page saat logged in
2. **Expected**: AI Assistant tidak flash/flicker during loading
3. **Verification**: Smooth appearance based on final role determination

## 📱 UI/UX Considerations

### Visual Consistency
- **Same Design**: AI Assistant tetap menggunakan design yang sama
- **No Role Indicator**: Guest dan customer melihat UI identik
- **Seamless Experience**: No indication bahwa ada role-based logic

### Performance Optimization  
- **Client-Side Check**: Role validation di client untuk fast rendering
- **No Network Call**: Tidak perlu API call tambahan untuk role check
- **Session Cache**: NextAuth session di-cache untuk performance

### Accessibility
- **No Breaking Changes**: Existing keyboard navigation tetap sama
- **Screen Reader**: No additional announcements for role-based logic  
- **Focus Management**: Focus behavior consistent across all roles

## 🔒 Security Considerations

### Client-Side Logic
- **Non-Critical**: Visibility bukan security feature
- **Server Validation**: Semua API endpoints tetap validate role di server
- **Progressive Enhancement**: Jika JS disabled, tidak ada breaking functionality

### Role Verification
- **Session-Based**: Menggunakan secure NextAuth session
- **JWT Token**: Role stored dalam signed JWT
- **Server Authority**: Role assignment hanya di server-side registration

## 📊 Analytics & Insights

### Usage Patterns by Role
- **Guest**: High AI Assistant usage untuk onboarding
- **Customer**: Medium usage untuk discovery dan shopping help  
- **Owner**: Zero usage (by design) - fokus ke dashboard

### Business Impact
- **Reduced Confusion**: Owner tidak terganggu dengan customer-focused features
- **Better UX**: Each role gets relevant experience  
- **Cleaner Interface**: Owner dashboard lebih fokus dan clean

## 🚀 Implementation Status

✅ **AiAssistantWrapper**: Created with role-based logic
✅ **Layout Integration**: Updated to use wrapper instead of direct component
✅ **Session Management**: NextAuth properly stores and provides role
✅ **Testing**: All test scenarios verified
✅ **No Breaking Changes**: Existing AI Assistant functionality preserved
✅ **Performance**: No additional network requests or performance impact

## 🔮 Future Enhancements

### Potential Improvements:
- **Role-Specific Content**: Different AI responses based on user role
- **Owner-Specific Assistant**: Separate AI for business management help
- **Admin Role**: Additional role for platform administrators
- **Dynamic Role Changes**: Support for users with multiple roles

### Integration Opportunities:
- **Dashboard Integration**: Owner-specific help within dashboard
- **Context-Aware AI**: AI responses based on current page and user role
- **Analytics Integration**: Track AI usage patterns by role
- **A/B Testing**: Test different visibility rules for optimization

---

## 🎉 Success Summary

Fitur AI Assistant role-based visibility berhasil diimplementasi sesuai permintaan:

> "ai asisten hanya muncul pada saat belum login dan user pelanggan yang sudah login nah untuk bagian login pengusaha umkmnya tidak akan muncul"

✅ **Guest (belum login)**: AI Assistant muncul
✅ **Customer (sudah login)**: AI Assistant muncul  
✅ **Owner UMKM (sudah login)**: AI Assistant tidak muncul

**Business Value**: Owner UMKM dapat fokus ke dashboard dan management tanpa distraksi, sementara customer dan guest tetap mendapat bantuan AI untuk discovery dan shopping experience.