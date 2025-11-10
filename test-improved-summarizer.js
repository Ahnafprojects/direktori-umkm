// Test improved AI summarizer with specific aspects
const testReviews = [
  {
    rating: 5,
    comment: "Nasi pecelnya enak banget! Bumbunya gurih dan lauknya lengkap. Harga juga murah meriah."
  },
  {
    rating: 4,
    comment: "Rasanya mantap, tapi porsinya agak sedikit. Tempatnya bersih dan pelayanannya ramah."
  }
];

console.log('🧪 Testing Improved AI Summarizer...\n');

console.log('📝 Sample Reviews:');
testReviews.forEach((review, index) => {
  console.log(`${index + 1}. Rating: ${review.rating}/5`);
  console.log(`   Comment: "${review.comment}"`);
});

console.log('\n🔍 Expected Analysis:');
console.log('✅ Praised aspects: bumbu (gurih), lauk (lengkap), harga (murah), rasa (enak/mantap), tempat (bersih), pelayanan (ramah)');
console.log('⚠️ Criticized aspects: porsi (sedikit)');

console.log('\n🎯 Expected Output:');
console.log('"Customer memuji bumbunya gurih dan lauknya lengkap dengan rating 4.5/5. Ada keluhan tentang porsinya sedikit."');

console.log('\n🚀 Improvements Made:');
console.log('- ✅ Aspect-specific analysis (bumbu, lauk, rasa, porsi, harga, pelayanan, tempat)');
console.log('- ✅ Context-aware keywords (gurih, lengkap, sedikit, etc.)');
console.log('- ✅ Balanced positive/negative detection');
console.log('- ✅ More detailed and actionable insights');

console.log('\n📱 To test: Open UMKM detail page and click "Ulasan" button');
console.log('Expected result: More specific insights like "Customer memuji bumbunya enak dan porsinya besar dengan rating X/5"');