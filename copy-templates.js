(async () => {
  const fs = await import('fs-extra');
  try {
    await fs.copy('src/email/templates', 'dist/email/templates');
    console.log('Templates copied successfully!');
  } catch (err) {
    console.error('Error copying templates:', err);
  }
})();
