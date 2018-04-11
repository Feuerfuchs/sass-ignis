// @ts-check

const formatter = results => 
	results.map(result => {
		var messages = result.warnings.concat(result.deprecations, result.invalidOptionWarnings);

		if (messages.length === 0) {
			return "";
		}

		return result.warnings
			.concat(result.deprecations, result.invalidOptionWarnings)
			.sort((m1, m2) => {
				if (m1.line == m2.line) {
					if (m1.column == m2.column) {
						return 0;
					} else {
						return m1.column - m2.column;
					}
				} else {
					return m1.line - m2.line;
				}
			})
			.map(message => message.severity + ": " + result.source + " (" + message.line + ", " + message.column + "): " + message.text)
			.join("\n") + "\n";
	})
	.filter(message => message.trim().length > 0)
	.join("\n");

module.exports = formatter;
