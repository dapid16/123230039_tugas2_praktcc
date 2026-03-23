const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all notes
router.get('/', (req, res) => {
  db.query('SELECT * FROM notes', (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// POST (tambah)
router.post('/', (req, res) => {
  const { judul, isi } = req.body;

  if (!judul || !isi) {
    return res.status(400).json({ message: 'Judul dan isi wajib diisi' });
  }

  db.query(
    'INSERT INTO notes (judul, isi) VALUES (?, ?)',
    [judul, isi],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Note added' });
    }
  );
});

// PUT (edit)
router.put('/:id', (req, res) => {
  const { judul, isi } = req.body;
  const { id } = req.params;

  if (!judul || !isi) {
    return res.status(400).json({ message: 'Judul dan isi wajib diisi' });
  }

  db.query(
    'UPDATE notes SET judul=?, isi=? WHERE id=?',
    [judul, isi, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Note updated' });
    }
  );
});

// DELETE
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.query(
    'DELETE FROM notes WHERE id=?',
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Note deleted' });
    }
  );
});

module.exports = router;