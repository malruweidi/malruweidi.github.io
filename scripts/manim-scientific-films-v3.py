#!/usr/bin/env python3
"""Ruwaidix: five source-bounded, CPU-renderable, *unapproved* scientific film inserts.

Manim Community Edition (MIT license). Every shot is an explanatory vector
schematic, not an experimental recording, measurement, historical photograph,
structural model, or clinical result. No cloud account/API/model credits needed.
Each scene is exactly 16 seconds at the selected render frame rate.
"""
from manim import *

BG = "#0c2026"
WHITE_SMOKE = "#eee7d9"
TEAL = "#8fc9bc"
AMBER = "#d3ae78"
BLUE = "#82aeca"
SOFT = "#46616a"


class EvidenceScene(Scene):
    TITLE = "Scientific mechanism"
    CONTEXT = "Conceptual explanation"

    def setup(self):
        self.camera.background_color = BG
        line = Line(LEFT * 6.35 + UP * 2.73, RIGHT * 6.35 + UP * 2.73,
                    color=SOFT, stroke_width=1.5)
        headline = Text(self.TITLE, color=WHITE_SMOKE, font_size=31,
                        font="DejaVu Sans").to_edge(UP, buff=.43)
        context = Text(self.CONTEXT, color=AMBER, font_size=18,
                       font="DejaVu Sans").next_to(headline, DOWN, buff=.25)
        warning = Text("CONCEPTUAL ANIMATION / NOT EXPERIMENTAL FOOTAGE",
                       color=TEAL, font_size=15, font="DejaVu Sans")
        warning.to_edge(DOWN, buff=.28)
        self.add(line, headline, context, warning)

    def finish(self, objects):
        # Every sequence: 2s establish, 3s explain, 5s demonstrate, 4s
        # reading/rest, 2s exit. Titles and caveats persist throughout.
        self.wait(4)
        self.play(FadeOut(objects), run_time=2)


class AirwayInterface(EvidenceScene):
    TITLE = "An airway reopens"
    CONTEXT = "A moving air-liquid interface in a simplified channel"

    def construct(self):
        top = Line(LEFT*5.5 + UP*1.1, RIGHT*5.5 + UP*1.1,
                   color=BLUE, stroke_width=5)
        bottom = Line(LEFT*5.5 + DOWN*1.2, RIGHT*5.5 + DOWN*1.2,
                      color=BLUE, stroke_width=5)
        outline = VGroup(top, bottom)
        cells = VGroup(*[
            RoundedRectangle(width=.42, height=.26, corner_radius=.07,
                             stroke_width=1, stroke_color=TEAL,
                             fill_color=TEAL, fill_opacity=.30)
            .move_to(LEFT*5.05 + RIGHT*(i*.50) + DOWN*1.43)
            for i in range(21)
        ])
        interface = Arc(radius=1.02, start_angle=-PI/2, angle=PI,
                        color=AMBER, stroke_width=9).move_to(LEFT*3.7)
        self.play(Create(outline), run_time=2)
        self.play(FadeIn(cells), Create(interface), run_time=3)
        self.play(interface.animate.shift(RIGHT*7.4), run_time=5,
                  rate_func=linear)
        self.finish(VGroup(outline, cells, interface))


class ACE2Topology(EvidenceScene):
    TITLE = "ACE2: topology changes context"
    CONTEXT = "Membrane-bound and soluble ectodomain: schematic only"

    def construct(self):
        membrane = VGroup(*[
            Line(LEFT*5 + DOWN*y, RIGHT*5 + DOWN*y,
                 color=TEAL, stroke_width=6)
            for y in (1.0, 1.3)
        ])
        stem = Line(LEFT*2.6+DOWN*1.0, LEFT*2.6+UP*.24,
                    color=AMBER, stroke_width=8)
        head = Ellipse(width=.92, height=1.1, color=AMBER,
                       fill_color=AMBER, fill_opacity=.23,
                       stroke_width=5).move_to(LEFT*2.6+UP*.8)
        target = DashedLine(RIGHT*2+UP*.4, RIGHT*2+UP*1.9,
                            dash_length=.15, color=SOFT)
        self.add(target)
        self.play(Create(membrane), run_time=2)
        self.play(Create(stem), FadeIn(head), run_time=3)
        self.play(FadeOut(stem), head.animate.shift(RIGHT*5.1+UP*.7),
                  run_time=5)
        self.finish(VGroup(membrane, head, target))


class MicrofluidicTransport(EvidenceScene):
    TITLE = "From flow to detection"
    CONTEXT = "Microchannel transport is not clinical diagnostic performance"

    def construct(self):
        walls = VGroup(
            Line(LEFT*5.4+UP*.85, RIGHT*5.4+UP*.85,
                 color=BLUE, stroke_width=6),
            Line(LEFT*5.4+DOWN*.85, RIGHT*5.4+DOWN*.85,
                 color=BLUE, stroke_width=6)
        )
        region = Rectangle(width=.65, height=1.62, color=AMBER,
                           fill_color=AMBER, fill_opacity=.12,
                           stroke_width=3).move_to(RIGHT*1.65)
        markers = VGroup(*[
            Dot(point=LEFT*(4.7-(i*.19))+UP*((i%5-2)*.24),
                radius=.075, color=TEAL)
            for i in range(14)
        ])
        self.play(Create(walls), run_time=2)
        self.play(FadeIn(markers), Create(region), run_time=3)
        self.play(*[dot.animate.shift(RIGHT*7.9) for dot in markers],
                  run_time=5, rate_func=linear)
        self.finish(VGroup(walls, markers, region))


class FoodExtrusion(EvidenceScene):
    TITLE = "Can the printed food hold shape?"
    CONTEXT = "Extrusion and deformation are material-dependent"

    def construct(self):
        base = Line(LEFT*5+DOWN*1.82, RIGHT*5+DOWN*1.82,
                    color=SOFT, stroke_width=8)
        nozzle = VGroup(
            Rectangle(width=.82, height=.92, color=BLUE,
                      fill_color=BLUE, fill_opacity=.2,
                      stroke_width=4).move_to(LEFT*2.8+UP*1.45),
            Line(LEFT*3.02+UP*.98, LEFT*3.02+UP*.53, color=BLUE,
                 stroke_width=8),
            Line(LEFT*2.58+UP*.98, LEFT*2.58+UP*.53, color=BLUE,
                 stroke_width=8)
        )
        printed = VGroup(*[
            Line(LEFT*2.8+RIGHT*.2+DOWN*(1.53-j*.30),
                 RIGHT*2.5+DOWN*(1.53-j*.30),
                 color=AMBER, stroke_width=15)
            for j in range(3)
        ])
        bead = Dot(point=LEFT*2.8+UP*.42, radius=.10, color=AMBER)
        self.play(Create(base), run_time=2)
        self.play(FadeIn(nozzle), FadeIn(bead), run_time=3)
        self.play(bead.animate.move_to(RIGHT*2.5+DOWN*.94),
                  Create(printed), run_time=5)
        self.finish(VGroup(base, nozzle, bead, printed))


class CeramicSintering(EvidenceScene):
    TITLE = "The scaffold after the furnace"
    CONTEXT = "Illustrative geometry change, not measured shrinkage"

    def construct(self):
        frame = Rectangle(width=7.3, height=4.1,
                          color=SOFT, stroke_width=2)
        grid = VGroup(*[
            Square(side_length=.77, color=TEAL,
                   stroke_width=6, fill_color=TEAL,
                   fill_opacity=.06)
            .move_to(LEFT*2.10+RIGHT*(i*.84)+DOWN*1.25+UP*(j*.84))
            for i in range(6) for j in range(4)
        ])
        label = Text("Processing may alter dimensions and porosity",
                     color=AMBER, font_size=20,
                     font="DejaVu Sans").move_to(DOWN*2.2)
        self.play(Create(frame), run_time=2)
        self.play(FadeIn(grid), FadeIn(label), run_time=3)
        self.play(grid.animate.scale(.89), run_time=5)
        self.finish(VGroup(frame, grid, label))
