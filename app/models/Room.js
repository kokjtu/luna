const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('./User')

const RoomSchema = new Schema({
  name: {
    type: String,
    unique: true,
    sparse: true,
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  messages: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      content: String,
      created_at: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
})

// RoomSchema.post('save', async function (doc, next) {
//   try {
//     await Promise.all(
//       doc.users.map((userID) => {
//         return (async () => {
//           await User.findOneAndUpdate(
//             { _id: userID },
//             {
//               $push: {
//                 rooms: doc._id,
//               },
//             },
//             { new: true }
//           )
//         })()
//       })
//     )
//   } catch (error) {
//     next(error)
//   }
// })

const Room = mongoose.model('Room', RoomSchema)
module.exports = Room
