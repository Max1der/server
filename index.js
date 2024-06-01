import express from 'express';
import mongoose from 'mongoose';
import UserModel from './models/User.js';
import ProblemModel from './models/Problem.js';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import checkAuth from './checkAuth.js';

mongoose.set('strictQuery', false);
// Подключение к базе данных
mongoose
    .connect(
        'mongodb+srv://admin:admin@ssadatabase.vbc6ogq.mongodb.net/SSA?retryWrites=true&w=majority&appName=SSADataBase'
    )
    .then(() => {
        console.log('Database Connected');
    })
    .catch((err) => {
        console.log('Database Error', err);
    });
// Инициализация приложения
const app = express();

// Подключение json
app.use(express.json());
app.use(cors());

// Методы
app.post('/auth/login', async (req, res) => {
    try {
        let user = await UserModel.findOne({ login: req.body.login, isAdmin: req.body.isAdmin });
        if (!user) {
            return res.status(403).json({ msg: 'Неверный логин или пароль' })
        }
        let ispassright = await bcrypt.compare(req.body.password, user.passwordHash);
        if (!ispassright) {
            return res.status(403).json({ msg: 'Неверный логин или пароль' })
        }
        const token = jwt.sign(
            {
                _id: user._id,
            },
            'secretKey',
            {
                expiresIn: '1d',
            }
        );
        return res.json({ token });
    } catch (err) {
        console.log(err);
        res.status(500);
    }
});

app.post('/auth/register', checkAuth, async (req, res) => {
    try {
        const registrator = await UserModel.findById(req.userId)
        if (!registrator.isAdmin) {
            return res.status(403).json({ msg: 'Вы не являетесь администратором' })
        }
        const samelogin = await UserModel.findOne({
            login: req.body.login

        })
        if (samelogin) {
            return res.status(500).json({ msg: 'Такой логин уже занят' })
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);
        let user = new UserModel({
            fio: req.body.fio,
            department: req.body.department,
            pc: req.body.pc,
            login: req.body.login,
            passwordHash: hash,
            isAdmin: req.body.isAdmin
        })
        const doc = await user.save()
        const token = jwt.sign(
            {
                _id: doc._id,
            },
            'secretKey',
            {
                expiresIn: '1d',
            }
        );
        return res.json({ token });
    } catch (err) {
        console.log(err);
        res.status(500);
    }
});

app.get('/auth/me', checkAuth, async (req, res) => {
    try {
        let user = await UserModel.findById(req.userId).select('-passwordHash');
        return res.json(user);
    } catch (err) {
        console.log(err);
        res.status(500);
    }
})


//zayavki
app.get('/problems', checkAuth, async (req, res) => {
    try {
        let initiator = await UserModel.findById(req.userId)
        if (!initiator.isAdmin) {
            return res.status(403).json({ msg: 'Вы не являетесь администратором' })
        }
        let problems = await ProblemModel.find().populate(['user','resolver'])
        problems.sort((a,b)=>{
            return new Date(b.createdAt)-new Date(a.createdAt)
        })
        return res.json(problems)
    } catch (err) {
        console.log(err);
        res.status(500);
    }
})

app.post('/problems', checkAuth, async (req, res) => {
    try {
        let initiator = await UserModel.findById(req.userId);
        if (initiator.isAdmin) {
            return res.status(403).json({ msg: 'Вы не являетесь администратором' })
        }
        let problem = new ProblemModel({
            text: req.body.text,
            level: req.body.level,
            user: req.userId
        })
        await problem.save()
        return res.json()
    } catch (err) {
        console.log(err);
        res.status(500);
    }
})
//
app.put('/problems/:id', checkAuth, async (req, res) => {
    try {
        // console.log(req.body.status)
        let initiator = await UserModel.findById(req.userId)
        if (!initiator.isAdmin) {
            return res.status(403).json({ msg: 'Вы не являетесь администратором' })
        }
        let problem = await ProblemModel.findById(req.params.id)
        problem.status = req.body.status
        problem.resolver = req.userId
        await problem.save()
        return res.json({ msg: 'Статус обновлен', resolver:initiator.fio })
    } catch (err) {
        console.log(err);
        res.status(500);
    }
})

//polzovateli

app.get('/user', checkAuth, async (req, res) => {
    try {
        let initiator = await UserModel.findById(req.userId)
        if (!initiator.isAdmin) {
            return res.status(403).json({ msg: 'Вы не являетесь администратором' })
        }
        let users = await UserModel.find()
        return res.json(users)
    } catch (err) {
        console.log(err);
        res.status(500);
    }
})

app.delete('/user/:id', checkAuth, async (req, res) => {
    try {
        let initiator = await UserModel.findById(req.userId)
        if (!initiator.isAdmin) {
            return res.status(403).json({ msg: 'Вы не являетесь администратором' })
        }
        await UserModel.findByIdAndDelete(req.params.id);
        return res.json({
            message: 'Пользователь успешно удалён!',
        });
    } catch (error) {
        console.log(err);
        res.status(500);
    }
})

// Запуск приложения
app.listen(4444, (err) => {
    if (err) {
        return console.log(err);
    }
    console.log('Server started');
});
