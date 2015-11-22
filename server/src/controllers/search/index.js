var q = require('q');

function controller (models) {
	function search (term) {
		var users = models.User.findAll({
			where: {
				alias: {
					$like: '%' + term + '%'
				}
			}
		})
		.then(function (results) {
			return results.map(function (result) {
				return {
					resource: 'users',
					name: result.alias
				};
			});
		});

		var characters = models.Gw2Character.findAll({
			where: {
				name: {
					$like: '%' + term + '%'
				}
			},
			include: [{
				model: models.Gw2ApiToken,
				where: {
					valid: true
				},
				include: models.User
			}]
		})
		.then(function (results) {
			return results.map(function (result) {
				return {
					resource: 'characters',
					name: result.name,
					alias: result.Gw2ApiToken.User.alias,
					accountName: result.Gw2ApiToken.accountName
				};
			});
		});

		var guilds = models.Gw2Guild.findAll({
			where: {
				name: {
					$like: '%' + term + '%'
				}
			}
		})
		.then(function (results) {
			return results.map(function (result) {
				return {
					resource: 'guilds',
					name: result.name
				};
			});
		});

		return q.all([users, characters, guilds])
			.then(function (results) {
				var mapped = [];

				results.forEach(function (result) {
					mapped = mapped.concat(result);
				})

				return mapped;
			});
	}

	return {
		search: search
	};
}

module.exports = controller;