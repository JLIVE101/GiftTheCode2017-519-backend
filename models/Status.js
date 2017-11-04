var Status = sequelize.define('status', {
    memberId: {
        model: Member,
        key: 'memberId',
        type: Sequelize.INTEGER
    },
    active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    hash: {
        type: Sequelize.UUID,
        default: Sequelize.UUIDV4 
    },
    lastLogin: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
}, {
    timestamps: false
});