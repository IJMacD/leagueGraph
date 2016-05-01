$(function(){
	var svg = $('#graph'),
		xmlns = "http://www.w3.org/2000/svg",
		graph,
		//width = svg.width(),
		//height = svg.height(),
		yearGridSpacing = 40, 		// Pixels
		positionGridSpacing = 40,	// Pixels
		numYears = 33,				// Date Span in years
		numPositions = 260,			// Total depth
		positionsPerGridLine = 10,	// Gap between grid lines in postions
		gutterLeft = 100,
		gutterTop = 80,
		gutterRight = 50,
		gutterBottom = 130,
		rows = numPositions / positionsPerGridLine,
		cols = numYears-1,
		firstYear = 1983,
		title = "Dover Athletic Overall League Positions",
		width = gutterLeft + cols * yearGridSpacing + gutterRight,
		height = gutterTop + rows * positionGridSpacing + gutterBottom,
		doverAthleticPosition = [193,251,191,197,181,130,115,124,119,115,100,108,110,109,105,103,98,107,114,121,169,219,241,237,226,161,119,129,129,121,125,100,97],
		label,
		yearLabel,
		positionLabel,
		teamLine,
		leagueLines = [],
		hoverSpots = [],
		gridLines = [],
		positionLabels = [],
		yearLabels = [],
		zoom = [0,0,1,1];

	svg.attr('xmlns', xmlns);

	graph = document.createElementNS(xmlns, 'g');
	graph.setAttribute('transform', 'translate(0.5,0.5)');

	svg.append(graph);

		setSize(cols, rows);
		defineClipRegions(cols, rows);
	drawGraph();
		drawTitle();

	function drawGraph(){
		drawGrid(cols, rows);
		drawLeagueLines();
		drawTeamPosition(doverAthleticPosition);
		drawHoverSpots(doverAthleticPosition);
		drawPositionLabels();
		drawYearLabels();
	}

	(function(){
		var z1 = zoom,
			z2 = [0,0,0.5,0.5,1.0,1.0];
		svg.click(function(){
			animateZoom(zoom == z1 ? z2 : z1);
		});
	}());

	function setSize(cols, rows){
		svg[0].setAttribute('viewBox', "0 0 " + width + " " + height);
		//svg.attr('width', width);
		//svg.attr('height', height);
	}

	function defineClipRegions(cols, rows){
		var defs = document.createElementNS(xmlns, 'defs'),
			clipPath = document.createElementNS(xmlns, 'clipPath'),
			rect = document.createElementNS(xmlns, 'rect');

		// ---- Main Graph Area ----

		rect.setAttribute('x', gutterLeft);
		rect.setAttribute('y', gutterTop);
		rect.setAttribute('width', cols * yearGridSpacing);
		rect.setAttribute('height', rows * positionGridSpacing);

		clipPath.setAttribute('id', 'clipPath');
		clipPath.appendChild(rect);

		defs.appendChild(clipPath);

		// ---- Y-Axis Region ----

		clipPath = document.createElementNS(xmlns, 'clipPath');
		rect = document.createElementNS(xmlns, 'rect');

		rect.setAttribute('x', 0);
		rect.setAttribute('y', gutterTop);
		rect.setAttribute('width', gutterLeft);
		rect.setAttribute('height', rows * positionGridSpacing + 10);

		clipPath.setAttribute('id', 'yAxisClipPath');
		clipPath.appendChild(rect);

		defs.appendChild(clipPath);

		// ---- X-Axis Region ----

		clipPath = document.createElementNS(xmlns, 'clipPath');
		rect = document.createElementNS(xmlns, 'rect');

		rect.setAttribute('x', -(gutterTop + (3 + rows) * positionGridSpacing));
		rect.setAttribute('y', 5 + gutterLeft - yearGridSpacing);
		rect.setAttribute('width', height - (gutterTop + rows * positionGridSpacing));
		rect.setAttribute('height', (1+cols) * yearGridSpacing);

		clipPath.setAttribute('id', 'xAxisClipPath');
		clipPath.appendChild(rect);

		defs.appendChild(clipPath);

		svg.append(defs);
	}

	function drawGrid(cols, rows){
		var line,
			i,
			l,
			x1, y1,
			x2, y2,
			dw = yearGridSpacing,
			dh = positionGridSpacing,
			stroke = "#808080",
			strokeAxis = "#000000",
			strokeWidth = 1,
			p1, p2;

		// Vertical Lines
		i = 0;
		l = cols+1;;
		x1 = 0;
		x2 = x1;
		y1 = 0;
		y2 = y1 + rows * dh;

		for(;i < l; i++){
			p1 = mapZoom(x1,y1);
			p2 = mapZoom(x2,y2);
			if(!gridLines[i]){
				gridLines[i] = document.createElementNS(xmlns, 'line');
				gridLines[i].setAttribute('stroke', (i == 0) ? strokeAxis : stroke);
				gridLines[i].setAttribute('stroke-width', strokeWidth);
				gridLines[i].setAttribute('clip-path', 'url(#clipPath)');

				graph.appendChild(gridLines[i]);
			}
			gridLines[i].setAttribute('x1', p1.x.toFixed());
			gridLines[i].setAttribute('y1', p1.y.toFixed());
			gridLines[i].setAttribute('x2', p2.x.toFixed());
			gridLines[i].setAttribute('y2', p2.y.toFixed());

			x1 += dw;
			x2 = x1;
		}

		// Horizontal Lines
		i = 0;
		l = rows + 1;
		x1 = 0;
		x2 = x1 + cols * dw;
		y1 = 0;
		y2 = y1;

		for(;i < l; i++){
			p1 = mapZoom(x1,y1);
			p2 = mapZoom(x2,y2);
			line = cols+1+i;
			if(!gridLines[line]){
				gridLines[line] = document.createElementNS(xmlns, 'line');
				gridLines[line].setAttribute('stroke', (i == l - 1) ? strokeAxis : stroke);
				gridLines[line].setAttribute('stroke-width', strokeWidth);
				gridLines[line].setAttribute('clip-path', 'url(#clipPath)');

				graph.appendChild(gridLines[line]);
			}
			gridLines[line].setAttribute('x1', p1.x.toFixed());
			gridLines[line].setAttribute('y1', p1.y.toFixed());
			gridLines[line].setAttribute('x2', p2.x.toFixed());
			gridLines[line].setAttribute('y2', p2.y.toFixed());

			y1 += dh;
			y2 = y1;
		}
	}

	function drawLeagueLines(){
		var leagues = [
			[22,22,22,22,21,20,20,20,22,22,22,22,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
			[44,44,44,44,44,44,44,44,46,46,46,46,44,44,44,44,44,44,44,44,44,44,44,44,44,44,44,44,44,44,44,44,44],
			[68,68,68,68,68,68,68,68,70,70,70,70,68,68,68,68,68,68,68,68,68,68,68,68,68,68,68,68,68,68,68,68,68],
			[92,92,92,92,92,92,92,92,93,92,92,92,90,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92,92],
			[114,114,114,114,114,114,114,114,115,114,114,114,112,114,114,114,114,114,114,114,114,114,114,116,116,116,116,116,116,116,116,116,116],
			[156,178,178,180,180,180,180,180,181,180,180,180,178,180,180,180,181,181,181,183,183,158,158,160,160,160,160,160,160,160,160,160,160],
			[218,257,262,260,273,268,268,268,269,267,267,267,265,268,268,268,269,269,269,297,297,224,224,226,225,226,226,226,226,226,226,226,226]
		],
		i = 0,
		l = leagues.length,
		league,
		j, m,
		points,
		stroke = "#FFFF00",
		strokeWidth = 4,
		verticalScale = positionGridSpacing / positionsPerGridLine,
		p;
		for(;i<l;i++){
			league = leagues[i];
			j = 0;
			m = league.length;
			points = [];
			for(;j<m;j++){
				p = mapZoom(j*yearGridSpacing, league[j]*verticalScale);
				points.push(p.x+","+p.y);
			}
			if(!leagueLines[i]){
				leagueLines[i] = document.createElementNS(xmlns, 'polyline');
				leagueLines[i].setAttribute('fill', 'none');
				leagueLines[i].setAttribute('stroke', stroke);
				leagueLines[i].setAttribute('stroke-width', strokeWidth);
				leagueLines[i].setAttribute('clip-path', 'url(#clipPath)');
				graph.appendChild(leagueLines[i]);
			}
			leagueLines[i].setAttribute('points', points.join(" "));
		}
	}

	function drawTeamPosition(position){
		var i = 0,
			l = position.length,
			points = [],
			stroke = "#8000FF",
			strokeWidth = 6,
			verticalScale = positionGridSpacing / positionsPerGridLine,
			p;
		for(;i<l;i++){
			p = mapZoom(i*yearGridSpacing, position[i]*verticalScale);
			points.push(p.x+","+p.y);
		}
		if(!teamLine){
			teamLine = document.createElementNS(xmlns, 'polyline');
			teamLine.setAttribute('fill', 'none');
			teamLine.setAttribute('stroke', stroke);
			teamLine.setAttribute('stroke-width', strokeWidth);
			teamLine.setAttribute('stroke-linecap', 'square');
			teamLine.setAttribute('clip-path', 'url(#clipPath)');
			graph.appendChild(teamLine);
		}
		teamLine.setAttribute('points', points.join(" "));
	}

	function drawTitle(){
		var	x,
			y = 48 + 10,
			style = "font-size:48px;line-height:125%;fill:#000000;fill-opacity:1;stroke:none;font-family:Arial",
			text = document.createElementNS(xmlns, 'text');

		text.setAttribute('y', y);
		text.setAttribute('style', style);
		text.appendChild(document.createTextNode(title));
		graph.appendChild(text);

		x = (width / 2) - (text.clientWidth / 2);
		text.setAttribute('x', x);
	}

	function drawPositionLabels(){
		var i = 2,
			l = numPositions / positionsPerGridLine,
			style = "font-size:28px;line-height:125%;fill:#000000;fill-opacity:1;stroke:none;font-family:Arial",
			verticalScale = positionGridSpacing / positionsPerGridLine,
			p,
			label;
		for(;i<=l;i+=2){
			p = mapZoom(0, i*positionGridSpacing);
			label = i * positionsPerGridLine;
			if(!positionLabels[i]){
				positionLabels[i] = document.createElementNS(xmlns, 'text');
				positionLabels[i].setAttribute('style', style);
				positionLabels[i].appendChild(document.createTextNode(label));
				positionLabels[i].setAttribute('clip-path', 'url(#yAxisClipPath)');
				graph.appendChild(positionLabels[i]);
			}
			positionLabels[i].setAttribute('y', p.y + 10); // y + 0.5 * font-size

			positionLabels[i].setAttribute('x', gutterLeft - 10 - $(positionLabels[i]).width());
		}
	}

	function drawYearLabels(){
		var i = 0,
			l = numYears,
			style = "font-size:28px;line-height:125%;fill:#000000;fill-opacity:1;stroke:none;font-family:Arial",
			verticalScale = positionGridSpacing / positionsPerGridLine,
			x = 5,
			y = gutterTop + (3 + rows) * positionGridSpacing,
			p,
			label;
		for(;i<l;i+=1){
			p = mapZoom(x, y);
			x += yearGridSpacing;
			label = yearToSeason(firstYear + i)
			if(!yearLabels[i]){
				yearLabels[i] = document.createElementNS(xmlns, 'text');
				yearLabels[i].setAttribute('x', -y);
				yearLabels[i].setAttribute('style', style);
				yearLabels[i].setAttribute('transform', 'matrix(0,-1,1,0,0,0)');
				yearLabels[i].setAttribute('clip-path', 'url(#xAxisClipPath)');
				yearLabels[i].appendChild(document.createTextNode(label));
				graph.appendChild(yearLabels[i]);
			}
			yearLabels[i].setAttribute('y', p.x);
		}
	}

	function drawHoverSpots(positions){
		var i = 0,
			l = positions.length,
			stroke = "#FF0080",
			strokeWidth = 4,
			fill = "#A060FF",
			verticalScale = positionGridSpacing / positionsPerGridLine,
			p,
			year,
			position;
		for(;i<l;i++){
			position = positions[i];
			p = mapZoom(i*yearGridSpacing, position*verticalScale);
			year = firstYear + i;
			if(!hoverSpots[i]){
				hoverSpots[i] = $(document.createElementNS(xmlns, 'circle'));
				hoverSpots[i].attr('r', 10);
				hoverSpots[i].attr('fill', fill);
				hoverSpots[i].attr('stroke', stroke);
				hoverSpots[i].attr('stroke-width', strokeWidth);
				hoverSpots[i].attr('opacity', 0);
				(function(spot,year,position){
					spot.on('mouseover', function(e){
						e.target.setAttribute('opacity', 1);
						showLabel(spot.p.x,spot.p.y,year,position);
					}).on('mouseout', function(e){
						e.target.setAttribute('opacity', 0);
						hideLabel();
					});
				}(hoverSpots[i],year,position));
				graph.appendChild(hoverSpots[i][0]);
			}
			hoverSpots[i].p = p;
			hoverSpots[i].attr('cx', p.x);
			hoverSpots[i].attr('cy', p.y);
		}
	}

	function showLabel(x, y, year, position){
		if(!label){
			label = document.createElementNS(xmlns, 'g');

			var rect = document.createElementNS(xmlns, 'rect'),
				textStyle = "font-size:28px;line-height:125%;fill:#000000;fill-opacity:1;stroke:none;font-family:Arial";

			rect.setAttribute('fill', '#FFFFFF');
			rect.setAttribute('stroke', '#C0C0C0');
			rect.setAttribute('stroke-width', 4);
			rect.setAttribute('rx', 15);
			rect.setAttribute('ry', 15);
			rect.setAttribute('width', 240);
			rect.setAttribute('height', 70);

			label.appendChild(rect);

			yearLabel = document.createElementNS(xmlns, 'text');
			yearLabel.setAttribute('x', 20);
			yearLabel.setAttribute('y', 30);
			yearLabel.setAttribute('style', textStyle);

			label.appendChild(yearLabel);

			positionLabel = document.createElementNS(xmlns, 'text');
			positionLabel.setAttribute('x', 20);
			positionLabel.setAttribute('y', 60);
			positionLabel.setAttribute('style', textStyle);

			label.appendChild(positionLabel);

			graph.appendChild(label);
		}

		label.setAttribute('transform', 'translate('+(x+10)+','+(y+10)+')');

		$(yearLabel).text('Season: ' + yearToSeason(year));

		$(positionLabel).text('Position: ' + position);

		label.setAttribute('opacity', 1);
	}

	function hideLabel(){
		if(label){
			label.setAttribute('transform', 'translate(10000,10000)');
			label.setAttribute('opacity', 0);
		}
	}

	function yearToSeason(year){
		return year + "-" + (year + 1).toString().substr(2,2);
	}

	function mapZoom(x, y){
		var xZoomScale = 1/(zoom[2] - zoom[0]),
			yZoomScale = 1/(zoom[3] - zoom[1]),
			xZoomOffset = (cols * yearGridSpacing) * xZoomScale * zoom[0],
			yZoomOffset = (rows * positionGridSpacing) * yZoomScale * zoom[1];
		return {
			x: gutterLeft + (x * xZoomScale) - xZoomOffset,
			y: gutterTop + (y * yZoomScale) - yZoomOffset
		};
	}

	function animateZoom(targetZoom){
		var initZoom = zoom,
			duration = 1000, // msec
			dx0 = targetZoom[0] - initZoom[0],
			dy0 = targetZoom[1] - initZoom[1],
			dx1 = targetZoom[2] - initZoom[2],
			dy1 = targetZoom[3] - initZoom[3],
			startTime;

		requestAnimationFrame(animationStep);

		function animationStep(t){
			if(!startTime)
				startTime = t;

			var delta = t - startTime,
				frac = getBezier(delta / duration,0.25,0.1,0.25,1);

			if(frac >= 1){
				zoom = targetZoom;
			}
			else {
				zoom = [
					initZoom[0] + (dx0 * frac),
					initZoom[1] + (dy0 * frac),
					initZoom[2] + (dx1 * frac),
					initZoom[3] + (dy1 * frac)
				];
				requestAnimationFrame(animationStep);
			}

			drawGraph();
		}
	}

	function getBezier(t, x1,y1,x2,y2){
		// http://blogs.msdn.com/b/eternalcoding/archive/2011/11/01/css3-transitions.aspx
		// Extract X (which is equal to time here)
	    var f0 = 1 - 3 * x2 + 3 * x1;
	    var f1 = 3 * x2 - 6 * x1;
	    var f2 = 3 * x1;

	    var refinedT = t;
	    for (var i = 0; i < 5; i++) {
	        var refinedT2 = refinedT * refinedT;
	        var refinedT3 = refinedT2 * refinedT;

	        var x = f0 * refinedT3 + f1 * refinedT2 + f2 * refinedT;
	        var slope = 1.0 / (3.0 * f0 * refinedT2 + 2.0 * f1 * refinedT + f2);
	        refinedT -= (x - t) * slope;
	        refinedT = Math.min(1, Math.max(0, refinedT));
	    }

	    // Resolve cubic bezier for the given x
	    return 3 * Math.pow(1 - refinedT, 2) * refinedT * y1 +
	            3 * (1 - refinedT) * Math.pow(refinedT, 2) * y2 +
	            Math.pow(refinedT, 3);
	}
});
