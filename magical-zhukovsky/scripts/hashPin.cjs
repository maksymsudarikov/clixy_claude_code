#!/usr/bin/env node

/**
 * PIN Hash Generator
 *
 * Usage: node scripts/hashPin.js [PIN]
 * Example: node scripts/hashPin.js 9634
 *
 * If no PIN is provided, it will prompt for one.
 */

const crypto = require('crypto');
const readline = require('readline');

function hashPin(pin) {
  return crypto.createHash('md5').update(pin).digest('hex');
}

function main() {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    const pin = args[0];
    const hash = hashPin(pin);
    console.log('\n✅ PIN Hash Generated:');
    console.log(`PIN: ${pin}`);
    console.log(`Hash: ${hash}`);
    console.log('\n📝 Add this to your .env file:');
    console.log(`VITE_ADMIN_PIN_HASH=${hash}`);
    console.log('');
    return;
  }

  // Interactive mode
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter PIN to hash: ', (pin) => {
    if (!pin || pin.trim() === '') {
      console.log('❌ PIN cannot be empty');
      rl.close();
      return;
    }

    const hash = hashPin(pin.trim());
    console.log('\n✅ PIN Hash Generated:');
    console.log(`Hash: ${hash}`);
    console.log('\n📝 Add this to your .env file:');
    console.log(`VITE_ADMIN_PIN_HASH=${hash}`);
    console.log('');
    rl.close();
  });
}

main();
