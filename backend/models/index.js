const User = require('./User');
const AudioTrack = require('./AudioTrack');
const Subscription = require('./Subscription');

// A User has many AudioTracks
User.hasMany(AudioTrack, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    as: 'tracks'
});
AudioTrack.belongsTo(User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    as: 'user'
});

// A User has one Subscription
User.hasOne(Subscription, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    as: 'subscription'
});
Subscription.belongsTo(User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    as: 'user'
});

module.exports = {
    User,
    AudioTrack,
    Subscription
};
