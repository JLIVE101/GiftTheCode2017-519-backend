var Household = sequelize.define('household', {
    relationship_id: {
        model: Member,
        key: 'memberId',
        type: Sequelize.INTEGER
    },
    relationship_type: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    firstName: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    lastName: {
        type: Sequelize.STRING(50),
        allowNull: false
    }
}, {
    timestamps: false
});