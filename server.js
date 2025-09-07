import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// ✅ Search books
app.get("/api/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    const response = await axios.get(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
    );

    // Map useful fields
    const books = response.data.docs.map((book) => ({
      key: book.key, // Example: "/works/OL8165007W"
      title: book.title,
      author_name: book.author_name,
      first_publish_year: book.first_publish_year,
      cover_i: book.cover_i,
    }));

    res.json(books);
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// ✅ Get additional book details
app.get("/api/book/:workId", async (req, res) => {
  try {
    const { workId } = req.params;

    const response = await axios.get(
      `https://openlibrary.org/works/${workId}.json`
    );

    const data = response.data;

    const bookDetails = {
      title: data.title,
      description:
        typeof data.description === "string"
          ? data.description
          : data.description?.value || "No summary available",
      subjects: data.subjects || [],
      covers: data.covers
        ? data.covers.map(
            (id) => `https://covers.openlibrary.org/b/id/${id}-L.jpg`
          )
        : [],
      created: data.created?.value || null,
    };

    res.json(bookDetails);
  } catch (error) {
    console.error("Details error:", error.message);
    res.status(500).json({ error: "Failed to fetch book details" });
  }
});

app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
