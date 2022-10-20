const Note = require('../models/Note');
const User = require('../models/User');

const asyncHandler = require('express-async-handler');

// @desc Get all notes
// @route GET /notes
// @access Private

const getAllNotes = asyncHandler(async (req, res) => {
  //get all notes from db
  const notes = await Note.find().lean();

  // if no notes

  if (!notes?.length) {
    return res.status(400).json({ message: 'No notes found' });
  }

  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );
  res.json(notesWithUser);
});

// @desc Create new note
// @route POST /notes
// @access Private

const createNewNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;
  //confirm the data

  if (!user || !title || !text) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  //check duplicate titles

  const duplicate = await Note.findOne({ title }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: 'Title already exists' });
  }
  //create and store the new note
  const note = await Note.create(req.body);
  if (note) {
    return res.status(201)({ message: `New Note ${note.title} created` });
  } else {
    res.status(400).json({ message: 'Invalid note data received' });
  }
});

// @desc Update note
// @route PATCH /notes
// @access Private

const updateNote = asyncHandler(async (req, res) => {
  const { id, user, title, text } = req.body;
  //confirm data
  if (!id || !user || !title || !text) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  // confirm note exists to update
  const note = await Note.findById(id).exec();
  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  // check for duplicate titles
  const duplicate = await Note.findOne({ title }).lean().exec();
  if (duplicate && duplicate._id.toString() !== id) {
    return res.status(409).json({ message: 'Note Title already exists' });
  }

  // update note
  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();
  res.json(`${updatedNote.title} updated`);
});

// @desc Delete a note
// @route DELETE /notes
// @access Private

const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;
  //confirm data
  if (!id) {
    return res.status(400).json({ message: 'Note id is required' });
  }
  // confirm note exists to delete
  const note = await Note.findById(id).exec();
  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }
  // delete note
  const result = await note.deleteOne();
  const reply = `Note ${result.title} With ID ${result._id} deleted`;
  res.json(reply);
});

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
};
