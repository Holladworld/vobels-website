// src/pages/api/test-webhook.ts
export const GET = async () => {
  // Hardcode for testing (remove after fixed)
  const sheetUrl = "https://script.google.com/macros/s/AKfycby9bk1UUpuJUNkpQgPDLRNlDjMnKkNZL6DFn5jlVJx0hEPDzPksMQ-1GieM7VQNBKjlhA/exec";
  
  const testData = {
    transaction: {
      Date: new Date().toLocaleDateString('en-GB'),
      Name: "Test User",
      Email: "test@example.com",
      WhatsApp: "1234567890",
      Amount: "100.00",
      Description: "Test Transaction",
      Ref: `TEST_${Date.now()}`,
      Category: "agent",  // ✅ ADD THIS
      ProductId: "AGENT_PRO_001"
    }
  };
  
  const response = await fetch(sheetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testData)
  });
  
  const result = await response.json();
  
  return new Response(JSON.stringify({ success: true, result }, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
};