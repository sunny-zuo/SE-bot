const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tempRoleSchema = new Schema({
    assigned_by: String,
    assigned_to: String,
    role_id: String,
    expiry: Date
}, {
    timestamps: true
})

const TempRole = mongoose.model('TempRole', tempRoleSchema);

module.exports = TempRole;