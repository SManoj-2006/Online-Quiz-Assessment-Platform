import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class JsonCollection {
  constructor(name) {
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  async read() {
    try {
      const data = await fs.promises.readFile(this.filePath, 'utf8');
      return JSON.parse(data || '[]');
    } catch (err) {
      return [];
    }
  }

  async write(data) {
    await fs.promises.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  async find(query = {}) {
    const data = await this.read();
    return data.filter(item => {
      for (const key in query) {
        if (query[key] !== item[key]) return false;
      }
      return true;
    });
  }

  async findOne(query = {}) {
    const data = await this.read();
    return data.find(item => {
      for (const key in query) {
        if (query[key] !== item[key]) return false;
      }
      return true;
    }) || null;
  }

  async findById(id) {
    const data = await this.read();
    return data.find(item => item._id === id) || null;
  }

  async create(doc) {
    const data = await this.read();
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    data.push(newDoc);
    await this.write(data);
    return newDoc;
  }

  async findByIdAndUpdate(id, update, options = { new: true }) {
    const data = await this.read();
    const index = data.findIndex(item => item._id === id);
    if (index === -1) return null;
    
    // Apply update
    data[index] = {
      ...data[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    
    await this.write(data);
    return data[index];
  }

  async findByIdAndDelete(id) {
    const data = await this.read();
    const index = data.findIndex(item => item._id === id);
    if (index === -1) return null;
    const deleted = data.splice(index, 1)[0];
    await this.write(data);
    return deleted;
  }
  
  async deleteMany(query = {}) {
    const data = await this.read();
    const filtered = data.filter(item => {
      for (const key in query) {
        if (query[key] === item[key]) return false;
      }
      return true;
    });
    await this.write(filtered);
    return { deletedCount: data.length - filtered.length };
  }
}

export const dbStore = {
  users: new JsonCollection('users'),
  quizzes: new JsonCollection('quizzes'),
  questions: new JsonCollection('questions'),
  attempts: new JsonCollection('attempts')
};
