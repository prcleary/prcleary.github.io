---
title: "Plotting Likert-style questionnaire responses"
date: 2022-10-28
tags:
  - R
  - ggplot2
  - Snippet
---


```r
# variable = question
# value = response
# data aggregated and percentages calculated without excluding NAs (pctna)
chart_ob_comp <- ggplot(dat_ob_comp, aes(
  x = factor(variable, levels = rev(levels(variable))),
  y = N,
  fill = factor(
    value,
    levels = rev(c(
      'Not relevant',
      'No knowledge',
      'Some knowledge',
      'Competent',
      'Proficient',
      'NA'
    ))
  )
)) +
  geom_bar(stat = 'identity') +
  coord_flip() +
  geom_text(aes(y = N, label = paste0(pct_na, '%')),
            position = position_stack(vjust = 0.5),
            size = 3) +
  labs(x = 'Competency', y = 'Responses', fill = 'Response',
       title = 'Competencies',
       subtitle = 'Learning needs analysis',
       caption = '(add footnote here if you like)') +
  theme_minimal() +
  scale_fill_brewer(palette='Greens', direction = -1) +
  scale_y_continuous(expand = expansion(0)) +
  theme(legend.position = 'bottom') +
  guides(fill = guide_legend(nrow = 1))
ggsave(plot = chart_ob_comp, 'chart_ob_comp.png', width = 12, height = 5)

```


