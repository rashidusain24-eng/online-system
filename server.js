// Update data
app.put('/api/update/:id', authenticate, async (req, res) => {
  try {
    const updated = await Data.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { content: req.body.content },
      { new: true }
    );
    if (!updated) return res.json({ success: false, message: 'Not found or not yours' });
    res.json({ success: true, message: 'Updated!' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Delete data
app.delete('/api/delete/:id', authenticate, async (req, res) => {
  try {
    const deleted = await Data.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!deleted) return res.json({ success: false, message: 'Not found or not yours' });
    res.json({ success: true, message: 'Deleted!' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Change password
app.put('/api/change-password', authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.json({ success: false, message: 'Current password wrong' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Password updated!' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});