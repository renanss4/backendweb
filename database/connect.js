import { mongoose } from "mongoose";
import { config } from "dotenv";

config();

// const uri = `mongodb://${process.env.MONGODB_URL}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DBNAME}`;
const uri = `${process.env.MONGODB_URI}`;

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(uri);
    console.log("Conectado com sucesso ao banco de dados!");
  } catch (error) {
    console.error("Ocorreu um erro ao conectar ao banco de dados:", error);
  }
};
