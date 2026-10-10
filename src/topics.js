// Topic catalog shown in the "Pick a topic" grid.
// A topic with `lesson` links to its interactive lesson (a section on this
// page or a lesson.html page);
// the rest are listed as coming soon.

export const LEVELS = [
  { id: 'all', label: 'All levels' },
  { id: 'primary', label: 'Primary', grades: 'Grades 1–5' },
  { id: 'middle', label: 'Middle school', grades: 'Grades 6–8' },
  { id: 'secondary', label: 'High school', grades: 'Grades 9–12' },
];

export const TOPICS = [
  // Primary
  { title: 'Counting & place value', level: 'primary', glyph: '123', blurb: 'Group blocks into ones, tens and hundreds to see how numbers are built.', lesson: 'lesson.html?id=counting' },
  { title: 'Addition & subtraction', level: 'primary', glyph: '+−', blurb: 'Hop along a number line and watch numbers combine and take away.', lesson: 'lesson.html?id=addition' },
  { title: 'Multiplication arrays', level: 'primary', glyph: '×', blurb: 'Rows times columns: see why 3 × 4 is the same as 4 × 3.', lesson: 'lesson.html?id=multiplication' },
  { title: 'Fractions', level: 'primary', glyph: '½', blurb: 'Slice pizzas and bars to compare halves, thirds and quarters.', lesson: 'lesson.html?id=fractions' },
  { title: 'Shapes & symmetry', level: 'primary', glyph: '◇', blurb: 'Fold and flip shapes to find their lines of symmetry.', lesson: 'lesson.html?id=symmetry' },
  { title: 'Telling time', level: 'primary', glyph: '3:15', blurb: 'Turn the clock hands and read the time in hours and minutes.', lesson: 'lesson.html?id=clock' },
  { title: 'Measurement', level: 'primary', glyph: 'cm', blurb: 'Measure a pencil with a ruler in centimetres and millimetres.', lesson: 'lesson.html?id=measurement' },

  // Middle school
  { title: 'Negative numbers', level: 'middle', glyph: '−n', blurb: 'Walk left of zero on the number line to add and subtract negatives.' },
  { title: 'Ratios & proportions', level: 'middle', glyph: 'a:b', blurb: 'Mix paint colours and keep the ratio the same as the batch grows.' },
  { title: 'Area & perimeter', level: 'middle', glyph: '▭', blurb: 'Stretch rectangles and triangles and watch area and perimeter change.' },
  { title: 'Angles', level: 'middle', glyph: '∠', blurb: 'Open a protractor and learn acute, right, obtuse and straight angles.' },
  { title: 'Solving equations', level: 'middle', glyph: 'x=', blurb: 'Keep the balance level to solve for x, one step at a time.' },
  { title: 'Coordinate plane', level: 'middle', glyph: '(x,y)', blurb: 'Plot points in four quadrants and play coordinate treasure hunt.' },
  { title: 'Probability', level: 'middle', glyph: 'P(A)', blurb: 'Roll dice and flip coins thousands of times to see chance settle down.' },
  { title: 'Pythagoras’ theorem', level: 'middle', glyph: 'a²+b²', blurb: 'Slide four triangles around to prove a² + b² = c² without algebra.', lesson: '#geometry' },

  // High school
  { title: 'Linear functions & slope', level: 'secondary', glyph: 'y=mx', blurb: 'Drag a line and watch slope and intercept change its equation.' },
  { title: 'Quadratics & parabolas', level: 'secondary', glyph: 'x²', blurb: 'Change a, b and c to move and stretch a parabola and find its roots.' },
  { title: 'Trigonometry & sine waves', level: 'secondary', glyph: 'sin', blurb: 'A point on the unit circle traces out sine and cosine waves.', lesson: '#trig' },
  { title: 'Circle theorems', level: 'secondary', glyph: '⊙', blurb: 'Move points around a circle and see which angles never change.' },
  { title: 'Vectors', level: 'secondary', glyph: '→', blurb: 'Add, scale and split arrows to understand direction and magnitude.' },
  { title: 'Statistics & data', level: 'secondary', glyph: 'μ', blurb: 'Drag data points and watch the mean, median and spread react.' },
  { title: 'Exponential growth', level: 'secondary', glyph: 'eˣ', blurb: 'Compare doubling with adding and see why growth curves explode.' },
  { title: 'Calculus: area under a curve', level: 'secondary', glyph: '∫', blurb: 'Fill a curve with rectangles until the sum becomes the integral.', lesson: '#calculus' },
];
