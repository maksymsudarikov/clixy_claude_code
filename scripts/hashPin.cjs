#!/usr/bin/env node

/**
 * PIN Hash Generator (bcrypt)
 *
 * Generates secure bcrypt hash for PIN authentication.
 * Upgraded from MD5 to bcrypt for better security (2025-12-29).
 *
 * Usage: node scripts/hashPin.cjs [PIN]
 * Example: node scripts/hashPin.cjs 9634
 *
 * If no PIN is provided, it will prompt for one.
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

const SALT_ROUNDS = 10;

async function hashPin(pin) {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    const pin = args[0];

    if (pin.length < 4) {
      console.log('❌ PIN should be at least 4 digits');
      return;
    }

    console.log('🔐 Generating bcrypt hash...');
    const hash = await hashPin(pin);

    console.log('\n✅ PIN Hash Generated (bcrypt):');
    console.log(`PIN: ${pin}`);
    console.log(`Hash: ${hash}`);
    console.log('\n📝 Add this to your .env file:');
    console.log(`VITE_ADMIN_PIN_HASH=${hash}`);
    console.log('\n⚠️  Note: This is a bcrypt hash (starts with $2a$)');
    console.log('   If migrating from MD5, make sure to update PinProtection.tsx');
    console.log('');
    return;
  }

  // Interactive mode
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter PIN to hash (4+ digits recommended): ', async (pin) => {
    if (!pin || pin.trim() === '') {
      console.log('❌ PIN cannot be empty');
      rl.close();
      return;
    }

    if (pin.trim().length < 4) {
      console.log('⚠️  Warning: PIN is shorter than 4 digits (not recommended)');
    }

    console.log('🔐 Generating bcrypt hash...');
    const hash = await hashPin(pin.trim());

    console.log('\n✅ PIN Hash Generated (bcrypt):');
    console.log(`Hash: ${hash}`);
    console.log('\n📝 Add this to your .env file:');
    console.log(`VITE_ADMIN_PIN_HASH=${hash}`);
    console.log('\n⚠️  Note: This is a bcrypt hash (starts with $2a$)');
    console.log('   Make sure PinProtection.tsx uses bcrypt verification');
    console.log('');
    rl.close();
  });
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
