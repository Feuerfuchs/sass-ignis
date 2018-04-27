# Ignis

Ignis is a [SASS](http://sass-lang.com/) library that I developed to create websites.
Its main feature is a **[BEM system](#bem-system)**, though it also includes some other useful features:

- [Easing background gradients](#easing-background-gradients)
- [Context stacks](#context-stacks): A temporary data storage
- [Property trees](#property-trees): A persistent data storage
- [Fluid properties](#fluid-properties): A generalization of fluid typography
- [Modular scales](#modular-scales)

All features are explained in greater detail in the [Wiki](https://github.com/Feuerfuchs/sass-ignis/wiki).  
For thorough explanations about single mixins, functions and variables, check the [SassDoc documentation](https://ignis-doc.feuerfuchs.eu/).  
The rest of this document is a quick overview over what Ignis has to offer.

## Getting started

Install the package `sass-ignis` from the npm repository using the package manager of your choice.

- npm: `npm install sass-ignis`
- yarn: `yarn add sass-ignis`

Then include Ignis in your SASS stylesheet:

```scss
// overrides
@import 'sass-ignis/src/main';
// rest of your files
```

If you want to use a function Ignis provides to override variables, import `sass-ignis/src/prep` before the overrides.

Ignis uses function, mixin and variable names that are prefixed with 'ig-' to avoid clashes with other libraries.
There are, however, shorter versions of many mixins and functions available (referred to as "shortcodes").
Just import one of these files to use a certain set of shortcodes:

- `sass-ignis/src/bem-shortcodes`: BEM
- `sass-ignis/src/fluid-shortcodes`: Fluid properties
- `sass-ignis/src/harmony-shortcodes`: Modular scales

**Note:** If the 'node_modules' folder isn't a search path for SASS imports, you have to prefix your imports with the path to 'node_modules'.
An import might then look like this: `@import 'node_modules/sass-ignis/src/main';`

## Development

Clone the repository, then run `npm install` or `yarn` to install all dependencies.

The following npm scripts are available:

- `lint`: Lint the source code with [sass-lint](https://www.npmjs.com/package/sass-lint).
- `livelint`: Lint automatically whenever the code changes.
- `doc`: Generate the SassDoc documentation with [sassdoc](http://sassdoc.com/).
- `test`: Run unit tests with [sass-true](https://www.npmjs.com/package/sass-true) and [Mocha](https://mochajs.org/).

## Known issues

Check out the [issue tracker](https://github.com/Feuerfuchs/sass-ignis/issues).

## Features

### BEM system

Ignis' main feature is its BEM system which was developed over the course of two years. Features include:

- Full [BEM](https://en.bem.info/) and [BEMIT](https://csswizardry.com/2015/08/bemit-taking-the-bem-naming-convention-a-step-further/) support, i.e. namespaced blocks, suffixes, states, and so on.
- Robustness: Most selector-related operations use SASS' native selector functions instead of manual parsing and assembling.
- Quality: All mixins generate optimal selectors with a minimal degree of specificity.
- Safety: All mixins perform checks if they are used correctly.
- Flexibility: Mix BEM selectors and other selectors however you like — the BEM system will adapt.
- Strictness: The BEM system allows you to define rules that control how the BEM mixins may or may not be used.

Below is a basic example showing how the BEM system can be used:

```scss
@include ig-bem-object('media') {
    display:         flex;
    align-items:     flex-start;
    justify-content: flex-start;

    @include ig-bem-element('image') {
        display:  block;
        flex:     0 0 auto;
        order:    1;
        overflow: hidden;
    }

    @include ig-bem-element('body') {
        order: 2;
    }

    @include ig-bem-modifier('rtl') {
        justify-content: flex-end;

        @include ig-bem-element('image') {
            order: 2;
        }

        @include ig-bem-element('body') {
            order: 1;
        }
    }
}
```

The result is this CSS:

```css
.o-media {
    display:         flex;
    align-items:     flex-start;
    justify-content: flex-start;
}

.o-media__image {
    display:  block;
    flex:     0 0 auto;
    order:    1;
    overflow: hidden;
}

.o-media__body {
    order: 2;
}

.o-media--rtl {
    justify-content: flex-end;
}

.o-media--rtl .o-media__image {
    order: 2;
}

.o-media--rtl .o-media__body {
    order: 1;
}
```

### Easing background gradients

The background gradients generated by browsers usually have a pretty hard transition from one color to another. In some situations, this results in a clearly visible edge where the transition ends.

[Andreas Larsen wrote an article on CSS-Tricks](https://css-tricks.com/easing-linear-gradients/) where this whole problem is explained in detail.
He also developed a solution, a [PostCSS plugin](https://github.com/larsenwork/postcss-easing-gradients) which automatically converts linear gradients using an easing function into regular linear-gradients.

This solution works for simple use cases, but unfortunately it wasn't suitable for me.
First, I wanted to use easing radial-gradients as well, which aren't supported by the PostCSS plugin.
And second, I wanted to freely position the color stops and not be locked to 0% for the start and 100% for the end.

The easing gradients provided by Ignis address the above problems.
Moreover, they have one more major feature: You can use multiple color stops with varying easing functions.

The syntax is kept as close to the [new CSSWG proposal](https://github.com/w3c/csswg-drafts/issues/1332) as possible to make the transition to the native easing gradients easier later on.

Example usage:

```scss
.test {
    background-image: ig-easing-linear-gradient(
        to right,
        #000 2em,
        #f00,
        ease-in-out-sine,
        transparent 10em
    );
}
```

This will generate a linear-gradient where black normally fades into red, from 2em to 6em.
Then, red *smoothly* fades into transparent, from 6em to 10em.
After that, the gradient remains transparent.

### Context stacks

Context stacks are a temporary data storage and, as the name suggests, are used like a conventional stack data structure.
This means: Whenever you want to store a context -- which is an identifier and any kind of data, such as a map, a list, a string, etc... -- you push it to the stack.
From then on, this context is publicly accessible.
In order to remove it, you pop the stack.

This feature becomes extremely useful when paired with mixins and their `@content` directive: Pushing a context to the stack before `@content` and popping the stack afterwards gives it the role of a call stack.
Thats how the BEM system, for example, attaches metadata to the selectors it generates.
These information are used to generate optimal selectors without much parsing.

Below is an example of how context stacks can be used:

```scss
$context-id: 'some-context-stack';

@mixin anything($p) {
    @include ig-context-push($context-id, 'anything', (
        --this: 1,
        --is:   true,
        --the:  'test',
        --data: $p
    ));

    @content;

    @include ig-context-pop($context-id);
}

// Usage:

.test {
    @include anything('hello') {
        $context-data: nth(ig-context-get($context-id, 'anything'), 2);
        $this: map-get($context-data, --this); // 1
        $is:   map-get($context-data, --is);   // true
        $the:  map-get($context-data, --the);  // 'test'
        $data: map-get($context-data, --data); // 'hello'
    }
}
```

### Property trees

Property trees are basically global maps that are immutable as long as you just use the intended functions.

It's a very simple feature, but it makes managing large sets of structured data much easier.

Example usage:

```scss
@include ig-props-save((
    --accent:      #f00,
    --accent-text: #fff,

    --background:     #fff,
    --text:           #222,
    
    --link: (
        --idle: (
            --text:      #000,
            --underline: #f00
        ),
        --hover: (
            --text:      #f00,
            --underline: #f00
        )
    )
), 'light');

// Usage:

p {
    color:            ig-props-get(--text, 'light');       // #222
    background-color: ig-props-get(--background, 'light'); // #fff
}

a {
    color:            ig-props-get(--link --idle --text, 'light');                // #000
    border-bottom:    1px solid ig-props-get(--link --idle --underline, 'light'); // #f00
    text-decoration:  none;

    &:hover {
        color:               ig-props-get(--link --hover --text, 'light');      // #f00
        border-bottom-color: ig-props-get(--link --hover --underline, 'light'); // #f00
    }
}
```

### Fluid properties

[Fluid typography](https://www.smashingmagazine.com/2016/05/fluid-typography/) is a technique where font sizes dynamically respond to the viewport size using viewport units like `vw`, `vh` and so on.
Ignis provides mixins that can apply this concept to any property that accepts a numeric input.

```scss
.title {
    @include ig-fluid-property(padding, ( 20rem: 2.1rem, 40rem: 2.6rem, 60rem: 3.5rem ));
}
```

The padding will be 2.1rem if the viewport is 20rem wide, 2.6rem if it's 40rem wide, and 3.5rem if it's 60rem wide.
If the viewport is narrower than 20rem, the padding will stick with 2.1rem.
If the viewport is wider than 60rem, the padding will stick with 3.5rem.

If you use [include-media](https://include-media.com/), this mixin also supports named viewports.
So instead of the example above, you could also use something like this:

```scss
.title {
    @include ig-fluid-property(padding, ( phone: 2.1rem, tablet: 2.6rem, desktop: 3.5rem ));
}
```

### Modular scales

From the description of [modularscale-sass](https://github.com/modularscale/modularscale-sass):

> A modular scale is a list of values that share the same relationship. These values are often used to size type and create a sense of harmony in a design. Proportions within modular scales are all around us from the spacing of the joints on our fingers to branches on trees. These natural proportions have been used since the time of the ancient Greeks in architecture and design and can be a tremendously helpful tool to leverage for web designers.

Ignis provides a mixin to create basic and multi-stranded modular scales.
It's a lightweight alternative to modularscale-sass.

Example with a multi-stranded modular scale:

```scss
$mod-scale: 1em 2em, 1.1;

h1 {
   font-size: ig-harmony-modular-scale(3, $mod-scale...); // Will be: 1.128em
}
h2 {
   font-size: ig-harmony-modular-scale(2, $mod-scale...); // Will be: 1.1em
}
h3 {
   font-size: ig-harmony-modular-scale(1, $mod-scale...); // Will be: 1.026em
}
```

Combined with Ignis' fluid properties:

```scss
$fluid-mod-scale: (
    320px: (1rem 2rem, 1.1),
    640px: (1rem 2rem, 1.2)
);

h1 {
    @include ig-fluid-modular-scale(font-size, 3, $fluid-mod-scale);
}
h2 {
    @include ig-fluid-modular-scale(font-size, 2, $fluid-mod-scale);
}
h3 {
    @include ig-fluid-modular-scale(font-size, 1, $fluid-mod-scale);
}
```
