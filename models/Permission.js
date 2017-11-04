var Permission = sequelize.define('permission', {
    perm_id: {
        model: Member,
        key: 'memberId',
        type: Sequelize.INTEGER
    },
    perm_email: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    perm_mail: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    perm_phone: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    perm_solicit: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    perm_newsletter: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
}, {
    timestamps: false
});