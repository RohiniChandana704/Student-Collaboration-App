require('dotenv').config();

const u = process.env.MONGO_URI;

console.log('length:', u ? u.length : 'undefined');
console.log('starts with mongodb+srv://', u ? u.startsWith('mongodb+srv://') : false);
console.log('has quotes:', u ? (u.includes('"') || u.includes("'")) : false);
console.log('has trailing space:', u ? u !== u.trim() : false);

if (u) {
  const userMatch = u.match(/:\/\/([^:]+):/);
  console.log('username:', userMatch ? userMatch[1] : 'could not parse');

  const passMatch = u.match(/:\/\/[^:]+:([^@]+)@/);
  if (passMatch) {
    const pass = passMatch[1];
    console.log('password length:', pass.length);
    console.log('password has unencoded special chars:', /[@#%^&:\/\?\+ '"]/.test(pass));
  } else {
    console.log('could not parse password segment');
  }
}
