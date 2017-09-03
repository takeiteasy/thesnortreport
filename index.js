var month_days = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function is_leap_year(y) {
	return ((y % 4 == 0) && (y % 100 != 0)) || (y % 400 == 0);
}

function days_in_month(y, m) {
	var i = months.indexOf(m);
	return (i == 1 ? (is_leap_year(y) ? 29 : 28) : month_days[i]);
}

function date_to_ts(y, m, d=0) {
	return new Date(y + "-" + m + "-" + (d == 0 ? days_in_month(y, m) : d) + " 00:00:00 GMT +00:00").getTime().toString()
}

function day_suffix(n) {
    var s = ["th","st","nd","rd"],
    v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

window.onload = function() {
	var c_date = new Date();
	data = JSON.parse(data);
	patreon = JSON.parse(dataJson);
	paypigs = JSON.parse(paypigs);
	last_paypigs = JSON.parse(last_paypigs);

	var dates = [];
	var bits  = [];
	var subs  = [];
	var pays  = [];
	var bans  = [];
	var temps = [];
	for (var a in data) {
		for (var b in data[a]) {
			var tmp_bits = [], tmp_subs = [], tmp_bans = [], tmp_temps = [];
			for (var c in data[a][b]) {
				tmp_bits.push(data[a][b][c]['bits'] / 100);
				tmp_subs.push(data[a][b][c]['subs']);
				tmp_bans.push(data[a][b][c]['permabans'].length);
				tmp_temps.push(data[a][b][c]['bans'].length);
			}
			dates.push(b + ", " + a);
			bits.push(tmp_bits.reduce((a, b) => a + b, 0));
			subs.push(tmp_subs.reduce((a, b) => a + b, 0));
			bans.push(tmp_bans.reduce((a, b) => a + b, 0));
			temps.push(tmp_temps.reduce((a, b) => a + b, 0));

			var p_obj = patreon[date_to_ts(a, b)];
			if (typeof(p_obj) != "undefined")
				pays.push(p_obj['earnings']);
		}
	}
	if (pays.length < bits.length)
		pays.push(last_patreon);
	
	var this_month = data[c_date.getFullYear()][months[c_date.getMonth()]];
	var last_day = Object.keys(this_month)[Object.keys(this_month).length - 1];
	document.getElementById("ban_date").innerHTML = day_suffix(last_day) + " " + months[c_date.getMonth()] + ", " + c_date.getFullYear() + " bans";
	document.getElementById("bans_cont").innerHTML = "<div>Permabans</div><ul id='perma_list'></ul>";
	for (var b in this_month[last_day]['permabans']) {
	    document.getElementById("perma_list").innerHTML += "<li>" + this_month[last_day]['permabans'][b] + "</li>";
	}
	document.getElementById("bans_cont").innerHTML += "<div>Timeouts</div><ul id='timeout_list'></ul>";
	for (var b in this_month[last_day]['bans']) {
	    document.getElementById("timeout_list").innerHTML += "<li>" + this_month[last_day]['bans'][b] + "</li>";
	}

	var chart_main = new Chart(document.getElementById("chart_main").getContext('2d'), {
		type: 'line',
		data: {
			labels: dates,
			datasets: [{
				label: "Cheers",
				backgroundColor: 'rgba(255, 99, 132, 0.2)',
				borderColor: 'rgba(255, 99, 132, 1)',
				borderWidth: 1,
				fill: true,
				data: bits
			}, {
				label: "Subscribers",
				backgroundColor: 'rgba(54, 162, 235, 0.2)',
				borderColor: 'rgba(54, 162, 235, 1)',
				borderWidth: 1,
				fill: true,
				data: subs
			},
				{
					label: "Patreons",
					backgroundColor: 'rgba(255, 206, 86, 0.2)',
					borderColor: 'rgba(255, 206, 86, 1)',
					borderWidth: 1,
					fill: true,
					data: pays
				}]
		},
		options: {
			responsive: true,
			title: {
				display: true,
				text: "Revenue"
			},
			tooltips: {
				mode: 'index',
				intersect: false,
				callbacks: {
					label: function(tooltipItem, data) {
						return data.datasets[tooltipItem.datasetIndex].label + ": $" + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
					},
					footer: function(tooltipItems, data) {
						var sum = 0;
						tooltipItems.forEach(function(tooltipItem) {
							sum += data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
						});
						return 'Sum: $' + sum;
					},
				}
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: false,
						callback: function(value, index, values) {
							return '$' + value;
						}
					}
				}]
			}
		}
	});

	var p_labels = Object.keys(patreon).map(function(k) { return parseInt(k); });
	var last_month = months[(c_date.getMonth() == 0 ? 11 : c_date.getMonth() - 1)];
	var last_month_year = (last_month == "December" ? c_date.getFullYear() - 1 : c_date.getFullYear());
	var days_last_month = Array.from(Array(days_in_month(c_date.getYear(), last_month))).map((e, i) => i + 1);

	var chart_1 = new Chart(document.getElementById("chart_1").getContext('2d'), {
		type: 'line',
		data: {
			labels: days_last_month,
			datasets: [{
				label: "Patreon",
				backgroundColor: 'rgba(255, 206, 86, 0.2)',
				borderColor: 'rgba(255, 206, 86, 1)',
				borderWidth: 1,
				fill: true,
				data: days_last_month.map(function(n) { return patreon[date_to_ts(last_month_year, last_month, n)]['earnings']; })
			}]
		},
		options: {
			responsive: true,
			title: {
				display: true,
				text: last_month
			},
			tooltips: {
				mode: 'index',
				intersect: false,
				callbacks: {
					label: function(tooltipItem, data) {
						return data.datasets[tooltipItem.datasetIndex].label + ": $" + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
					},
					footer: function(tooltipItems, data) {
						var sum = 0;
						tooltipItems.forEach(function(tooltipItem) {
							sum += data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
						});
						return 'Sum: $' + sum;
					},
				}
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: false,
						callback: function(value, index, values) {
							return '$' + value;
						}
					}
				}]
			}
		}
	});

	var chart_2 = new Chart(document.getElementById("chart_2").getContext('2d'), {
		type: 'line',
		data: {
			labels: days_last_month,
			datasets: [{
				label: "Cheers",
				backgroundColor: 'rgba(255, 99, 132, 0.2)',
				borderColor: 'rgba(255, 99, 132, 1)',
				borderWidth: 1,
				fill: true,
				data: days_last_month.map(function(n) { return data[last_month_year][last_month][n]['bits'] / 100; })
			},
				{
					label: "Subscribers",
					backgroundColor: 'rgba(54, 162, 235, 0.2)',
					borderColor: 'rgba(54, 162, 235, 1)',
					borderWidth: 1,
					fill: true,
					data: days_last_month.map(function(n) { return data[last_month_year][last_month][n]['subs']; })
				},
			]
		},
		options: {
			responsive: true,
			title: {
				display: true,
				text: last_month
			},
			tooltips: {
				mode: 'index',
				intersect: false,
				callbacks: {
					label: function(tooltipItem, data) {
						return data.datasets[tooltipItem.datasetIndex].label + ": $" + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
					},
					footer: function(tooltipItems, data) {
						var sum = 0;
						tooltipItems.forEach(function(tooltipItem) {
							sum += data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
						});
						return 'Sum: $' + sum;
					},
				}
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: false,
						callback: function(value, index, values) {
							return '$' + value;
						}
					}
				}]
			}
		}
	});

	var sorted_paypigs = Object.keys(paypigs).sort(function(a, b) { return paypigs[a] - paypigs[b] });
	var chart_3 = new Chart(document.getElementById("chart_3").getContext('2d'), {
		type: 'bar',
		data: {
			labels: sorted_paypigs,
			datasets: [{
				label: "Total Cheers",
				backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'],
				borderColor: ['rgba(255,99,132,1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255,99,132,1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255,99,132,1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255,99,132,1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255,99,132,1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255,99,132,1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
				borderWidth: 1,
				fill: true,
				data: sorted_paypigs.map(function(x) { return paypigs[x] / 100; })
			}]
		},
		options: {
			title: {
				display: true,
				text: "Cheer-leaderboards (Total)",
			},
			tooltips: {
				mode: 'index',
				callbacks: {
					label: function(tooltipItem, data) {
						return data.datasets[tooltipItem.datasetIndex].label + ": $" + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
					}
				}
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
						callback: function(value, index, values) {
							return '$' + value;
						}
					}
				}],
				xAxes: [{
					ticks: {
						autoSkip: false
					}
				}]
			}
		}
	});

	var sorted_last_paypigs = Object.keys(last_paypigs).sort(function(a, b) { return last_paypigs[a] - last_paypigs[b] });
	var chart_4 = new Chart(document.getElementById("chart_4").getContext('2d'), {
		type: 'bar',
		data: {
			labels: sorted_last_paypigs,
			datasets: [{
				label: "Total Cheers",
				backgroundColor: ["rgba(255, 159, 64, 0.2)", "rgba(153, 102, 255, 0.2)", "rgba(75, 192, 192, 0.2)", "rgba(255, 206, 86, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(255, 99, 132, 0.2)", "rgba(255, 159, 64, 0.2)", "rgba(153, 102, 255, 0.2)", "rgba(75, 192, 192, 0.2)", "rgba(255, 206, 86, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(255, 99, 132, 0.2)", "rgba(255, 159, 64, 0.2)", "rgba(153, 102, 255, 0.2)", "rgba(75, 192, 192, 0.2)", "rgba(255, 206, 86, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(255, 99, 132, 0.2)", "rgba(255, 159, 64, 0.2)", "rgba(153, 102, 255, 0.2)", "rgba(75, 192, 192, 0.2)", "rgba(255, 206, 86, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(255, 99, 132, 0.2)", "rgba(255, 159, 64, 0.2)", "rgba(153, 102, 255, 0.2)", "rgba(75, 192, 192, 0.2)", "rgba(255, 206, 86, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(255, 99, 132, 0.2)", "rgba(255, 159, 64, 0.2)", "rgba(153, 102, 255, 0.2)", "rgba(75, 192, 192, 0.2)", "rgba(255, 206, 86, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(255, 99, 132, 0.2)"],
				borderColor: ["rgba(255, 159, 64, 1)", "rgba(153, 102, 255, 1)", "rgba(75, 192, 192, 1)", "rgba(255, 206, 86, 1)", "rgba(54, 162, 235, 1)", "rgba(255,99,132,1)", "rgba(255, 159, 64, 1)", "rgba(153, 102, 255, 1)", "rgba(75, 192, 192, 1)", "rgba(255, 206, 86, 1)", "rgba(54, 162, 235, 1)", "rgba(255,99,132,1)", "rgba(255, 159, 64, 1)", "rgba(153, 102, 255, 1)", "rgba(75, 192, 192, 1)", "rgba(255, 206, 86, 1)", "rgba(54, 162, 235, 1)", "rgba(255,99,132,1)", "rgba(255, 159, 64, 1)", "rgba(153, 102, 255, 1)", "rgba(75, 192, 192, 1)", "rgba(255, 206, 86, 1)", "rgba(54, 162, 235, 1)", "rgba(255,99,132,1)", "rgba(255, 159, 64, 1)", "rgba(153, 102, 255, 1)", "rgba(75, 192, 192, 1)", "rgba(255, 206, 86, 1)", "rgba(54, 162, 235, 1)", "rgba(255,99,132,1)", "rgba(255, 159, 64, 1)", "rgba(153, 102, 255, 1)", "rgba(75, 192, 192, 1)", "rgba(255, 206, 86, 1)", "rgba(54, 162, 235, 1)", "rgba(255,99,132,1)"],
				borderWidth: 1,
				fill: true,
				data: sorted_last_paypigs.map(function(x) { return last_paypigs[x] / 100; })
			}]
		},
		options: {
			title: {
				display: true,
				text: "Cheer-leaderboards (" + last_month + ")",
			},
			tooltips: {
				mode: 'index',
				callbacks: {
					label: function(tooltipItem, data) {
						return data.datasets[tooltipItem.datasetIndex].label + ": $" + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
					}
				}
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
						callback: function(value, index, values) {
							return '$' + value;
						}
					}
				}],
				xAxes: [{
					ticks: {
						autoSkip: false
					}
				}]
			}
		}
	});
	
	var chart_5 = new Chart(document.getElementById("chart_5").getContext('2d'), {
		type: 'line',
		data: {
			labels: dates.slice(2),
			datasets: [{
			    label: "Bans",
				backgroundColor: 'rgba(153, 102, 255, 0.2)',
				borderColor: 'rgba(153, 102, 255, 1)',
				borderWidth: 1,
				fill: true,
				data: bans.slice(2)
			}, {
			    label: "Timeouts",
				backgroundColor: 'rgba(75, 192, 192, 0.2)',
				borderColor: 'rgba(75, 192, 192, 1)',
				borderWidth: 1,
				fill: true,
				data: temps.slice(2)
			}]
		},
		options: {
			responsive: true,
			title: {
				display: true,
				text: "Bans"
			},
			tooltips: {
				mode: 'index',
				intersect: false,
				callbacks: {
					label: function(tooltipItem, data) {
						return data.datasets[tooltipItem.datasetIndex].label + ": " + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
					},
				}
			},
			scales: {
				xAxes: [{
					ticks: {
						autoSkip: false
					}
				}]
			}
		}
	});

	var paymetonnes_chart1 = new Chart(document.getElementById("chart_paymetonnes1").getContext('2d'), {
		type: "line",
		data: {
			labels: p_labels,
			datasets: [{
				label: "Patreon $$$",
				backgroundColor: 'rgba(255, 206, 86, 0.2)',
				borderColor: 'rgba(255, 206, 86, 1)',
				borderWidth: 1,
				data: Object.keys(patreon).map(function(k) { return patreon[k]["earnings"] })
			}]
		},
		options: {
			responsive: true,
			title: {
				display: true,
				text: "Patreon History"
			},
			scales: {
				xAxes: [{
					type: "time",
					time: {
						format: "MM/DD/YYYY HH:mm",
						tooltipFormat: "ll HH:mm"
					}
				}],
				yAxes: [{
					ticks: {
						beginAtZero:true,
						callback: function(value, index, values) {
							return '$' + value;
						}
					}
				}]
			}
		}
	});

	var paymetonnes_chart2 = new Chart(document.getElementById("chart_paymetonnes2").getContext('2d'), {
		type: "line",
		data: {
			labels: p_labels,
			datasets: [{
				label: "Patreon Subs",
				backgroundColor: 'rgba(255, 159, 64, 0.2)',
				borderColor: 'rgba(255, 159, 64, 1)',
				borderWidth: 1,
				data: Object.keys(patreon).map(function(k) { return patreon[k]["patrons"] })
			}]
		},
		options: {
			responsive: true,
			title: {
				display: true,
				text: "Patreon Subs"
			},
			scales: {
				xAxes: [{
					type: "time",
					time: {
						format: "MM/DD/YYYY HH:mm",
						tooltipFormat: "ll HH:mm"
					}
				}]
			}
		}
	});
}