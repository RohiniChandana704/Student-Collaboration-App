const Question = require("../models/Question");

const createQuestion = async (req, res) => {
  try {
    const { title, description, category } = req.body;
if (!title || !description || !category) {
  return res.status(400).json({
    message: "Please provide title, description and category",
  });
}

if (title.length > 200) {
  return res.status(400).json({ message: "Title must be 200 characters or fewer" });
}

if (description.length > 5000) {
  return res.status(400).json({ message: "Description must be 5000 characters or fewer" });
}

if (category.length > 50) {
  return res.status(400).json({ message: "Category must be 50 characters or fewer" });
}

    const question = await Question.create({
      author: req.user._id,
      title,
      description,
      category,
    });

    res.status(201).json(question);
  } catch (error) {
    console.error("CREATE QUESTION ERROR:", error);
    res.status(500).json({ message: "Failed to create question", error: error.message });
  }
};

const getQuestions = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      const regex = new RegExp(req.query.search, "i");
      filter.$or = [{ title: regex }, { description: regex }];
    }

    const questions = await Question.find(filter)
      .populate("author", "name")
      .populate("answers.author", "name")
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (error) {
    console.error("GET QUESTIONS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch questions", error: error.message });
  }
};

const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("author", "name")
      .populate("answers.author", "name");

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (req.user) {
      const alreadyViewed = question.viewedBy.some(
        (id) => id.toString() === req.user._id.toString()
      );

      if (!alreadyViewed) {
        question.views += 1;
        question.viewedBy.push(req.user._id);
        await question.save();
      }
    }

    res.json(question);
  } catch (error) {
    console.error("GET QUESTION ERROR:", error);
    res.status(500).json({ message: "Failed to fetch question", error: error.message });
  }
};

const toggleVote = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const userId = req.user._id.toString();
    const alreadyVoted = question.votes.some((id) => id.toString() === userId);

    if (alreadyVoted) {
      question.votes = question.votes.filter((id) => id.toString() !== userId);
    } else {
      question.votes.push(req.user._id);
    }

    await question.save();

    res.json({ votesCount: question.votes.length });
  } catch (error) {
    console.error("TOGGLE VOTE ERROR:", error);
    res.status(500).json({ message: "Failed to vote", error: error.message });
  }
};

const addAnswer = async (req, res) => {
  try {
    const { text } = req.body;
if (!text) {
  return res.status(400).json({ message: "Answer text is required" });
}

if (text.length > 3000) {
  return res.status(400).json({ message: "Answer must be 3000 characters or fewer" });
}
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    question.answers.push({ author: req.user._id, text });
    await question.save();

    const updated = await Question.findById(req.params.id).populate(
      "answers.author",
      "name"
    );

    res.status(201).json(updated.answers);
  } catch (error) {
    console.error("ADD ANSWER ERROR:", error);
    res.status(500).json({ message: "Failed to add answer", error: error.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this question" });
    }

    await question.deleteOne();
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("DELETE QUESTION ERROR:", error);
    res.status(500).json({ message: "Failed to delete question", error: error.message });
  }
};

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
  toggleVote,
  addAnswer,
  deleteQuestion,
};